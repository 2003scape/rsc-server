const SmartBuffer = require('smart-buffer').SmartBuffer
const handlers = require('./handlers')
const packets = require('./opcodes').client

async function handle(session, packet) {
    const handler = handlers.get(packet.id)

    if (!handler) {
        session.emit('error', new Error(`unhandled packet: ${packet.id}`))
        return
    }

    try {
        await handler(session, SmartBuffer.fromBuffer(packet.payload))
    } catch (e) {
        session.emit('error', e)
        session.close()
    }
}

const SessionState = {
    Invalid: {
        // ignore messages in an invalid state
        handlePacket: async () => { }
    },
    SessionRequest: {
        handlePacket: async (session, packet) => {
            if (packet.id !== packets.session) {
                session.emit('error',
                    new Error(`invalid session packet: ${packet}`))
                return
            }

            await handle(session, packet)
        }
    },
    LoginRequest: {
        handlePacket: async (session, packet) => {
            if (packet.id !== packets.login) {
                session.emit('error',
                    new Error(`unexpected packet during login: ${packet.id}`))
                return
            }

            await handle(session, packet)
        }
    },
    LoggedIn: {
        // here, the session is fully identified and able to execute
        // any (available) command it wants (filter session & login requests?)
        handlePacket: handle
    }
}

module.exports = SessionState
