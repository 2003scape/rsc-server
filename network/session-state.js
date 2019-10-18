const handlers = require('./handlers')
const packets = require('./opcodes').client
const SmartBuffer = require('smart-buffer').SmartBuffer

async function handle(session, packet) {
    const handler = handlers.get(packet.id)

    if (!handler) {
        return console.warn(`${session}[${session.state().name}] sent an unknown packet: ${packet.id}`)
    }

    try {
        await handler(session, SmartBuffer.fromBuffer(packet.payload))
    } catch (error) {
        session.close()
        console.error(error)
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
                return console.warn(`${session} sent invalid session packet`)
            }
            handle(session, packet)
        }
    },
    LoginRequest: {
        handlePacket: async (session, packet) => {
            if (packet.id !== packets.login) {
                return console.warn(`${session} sent invalid login packet`)
            }
            handle(session, packet)
        }
    },
    LoggedIn: {
        // here, the session is fully identified and able to execute
        // any (available) command it wants (filter session & login requests?)
        handlePacket: handle
    }
}

module.exports = SessionState
