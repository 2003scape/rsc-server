// Decode a packet the client sent into an opcode and a payload.
// TODO: buffer incoming data, what if multiple packets are sent within the same frame?
// TODO: this could result in losing packets
function decodeBuffer(buffer) {
    let position = 0
    let id = 0
    let length = buffer[position++];

    if (length >= 160) {
        length = (length - 160) * 256 + buffer[position++]
    }

    let payload = Buffer.alloc(length)

    if (length >= 160) {
        buffer.copy(payload, 0, position)
    } else {
        payload[length - 1] = buffer[position++]

        if (length > 1) {
            buffer.copy(payload, 0, position, position + length - 1)
            id = payload[0]
            payload = payload.slice(1)
        } else {
            id = payload[0]
            payload = null
        }
    }

    return { id: id, payload: payload }
}

module.exports = decodeBuffer
