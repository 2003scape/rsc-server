// the session is waiting to read the first byte of the packet's header
const PACKET_STATE_HEADER = 0

// the session requires a second byte to be read from the header (in this case)
// the first byte was >= 160
const PACKET_STATE_HEADER_2BYTE = 1

// here, the session is reading the packet's body (or payload), the packet
// state will be reset to PACKET_STATE_HEADER after it has read the necessary
// bytes.
const PACKET_STATE_BODY = 2

// determines how many bytes are available to be read from a buffer
function availableBytes(buffer, offset) {
    return buffer.length - offset
}

// stashes any unread data into a buffer that the decoders can use later
function stashBuffer(packet, buffer, offset) {
    const available = availableBytes(buffer, offset)

    if (available > 0) {
        packet.stash = Buffer.alloc(available)
        packet.position = 0
        buffer.copy(packet.stash, 0, offset)
    } else {
        delete packet.stash
    }
}

function readPacketHeader(packet, buffer, position, available) { 
    if (packet.state === PACKET_STATE_HEADER) {
        // read the first byte of the packet's header, the length
        packet.length = buffer[position++]

        // if the length >= 160, there is an additional byte to be read,
        // as the first byte serves as the magnitude. this algorithm allows
        // the client to send up to 24575 bytes at once. we should probably
        // put a limit on this. the client should not send a packet that large.
        if (packet.length >= 160) {
            if (available >= 2) {
                // here, we have enough data available to fully read the length
                // we can jump right into reading the body.
                packet.length = (packet.length - 160) * 256 + buffer[position++]
                packet.state = PACKET_STATE_BODY
            } else {
                // however, we do not in this case. we have to wait for
                // additional data to arrive.
                packet.state = PACKET_STATE_HEADER_2BYTE
            }
        } else {
            // in this case, the packet's header was less than 160.
            // advance to the next state.
            packet.state = PACKET_STATE_BODY
        }
    } else if (packet.state === PACKET_STATE_HEADER_2BYTE) {
        // we have the second byte of the packet's header now. we can calculate
        // the length based off the magnitude and the current byte
        packet.length = (packet.length - 160) * 256 + buffer[position++]
        packet.state = PACKET_STATE_BODY
    } else {
        // somehow, someone called this function when they shouldn't have.
        throw new Error(`invalid packet state ${packet.state}`)
    }

    // save the position for the next read
    packet.position = position

    if (position < buffer.length) {
        // save any unread data for next time.
        stashBuffer(packet, buffer, position)
        packet.position = 0
    }
}

function readPacketBody(session, buffer, position, available) {
    const packet = session.packet

    // check that there is enough data in the buffer to be read
    if (available >= packet.length) {
        if (packet.length >= 160) {
            // the id is the first byte of the payload, followed by the actual
            // payload itself
            packet.id = buffer[position++]
            packet.payload = buffer.slice(position, position + packet.length)
            position += packet.length
        } else {
            // here, the id is the last byte in the payload for some reason..
            packet.payload = Buffer.alloc(packet.length)
            packet.payload[packet.length - 1] = buffer[position++]

            if (packet.length > 1) {
                buffer.copy(packet.payload, 0, position, position + packet.length - 1)
                packet.id = packet.payload[0]
                packet.payload = packet.payload.slice(1)
            } else {
                packet.id = packet.payload[0]
                packet.payload = null
            }

            position += packet.length
        }

        session.emit('packet')

        packet.state = PACKET_STATE_HEADER
    }

    // save the position for the next read
    packet.position = position

    if (position < buffer.length) {
        // save any unread data for next time.
        stashBuffer(packet, buffer, position)
    }
}

function decodePacket(session, buffer, tries = 0) {
    if (tries >= 5) {
        // something has gone wrong or a frame was REALLY large (packet flooding)
        // drop the buffer and start from scratch..
        session.packet = { state: 0, position: 0 }
        return
    }
    
    // we have data from a previous data frame that hasn't been read yet
    // so prepend it to the current buffer
    if (session.packet.stash) {
        buffer = Buffer.concat([session.packet.stash, buffer])
        session.packet.position = 0
        session.packet.stash = null
        delete session.packet.stash
    }

    let position = session.packet.position
    const available = availableBytes(buffer, position)

    if (available <= 0) {
        // no data to be read, what can ya do?
        return
    }

    switch (session.packet.state) {
        case PACKET_STATE_BODY:
            readPacketBody(session, buffer, position, available)
            break
        case PACKET_STATE_HEADER:
        case PACKET_STATE_HEADER_2BYTE:
        default:
            readPacketHeader(session.packet, buffer, position, available)
            break
    }

    if (session.packet.stash) {
        // there were leftover bytes from reading the packet's body
        // we can recursively call decodePacket() if multiple packets
        // arrived within one frame (or even read partial)
        decodePacket(session, Buffer.alloc(0), tries += 1)
    } else if (session.packet.state === PACKET_STATE_HEADER) {
        session.packet.position = 0
    }
}

module.exports = decodePacket
