const handlers = require('./packet/handlers')
const opcodes = require('./packet/opcodes')

async function handlePacket(session, packet) {
    if (!(packet.id in handlers)) {
        console.warn(`unhandled packet from ${session} => ${packet.id}`)
    } else {
        try {
            await handlers[packet.id](session, packet.payload)
        } catch (error) {
            session.emit('error', error)
        }
    }
}

const SessionState = {
    awaitingSessionRequest: async (session, packet) => {
        if (packet.id !== opcodes.client.session) {
            console.warn(`awaitingSessionRequest: ${session} invalid packet => ${packet.id}`)
        } else {
            await handlePacket(session, packet)
        }
    },
    awaitingLogin: async (session, packet) => {
        if (packet.id !== opcodes.client.login) {
            console.warn(`awaitingLogin: ${session} invalid packet => ${packet.id}`)
        } else {
            await handlePacket(session, packet)
        }
    },
    loggedIn: async (session, packet) => {
        if (packet.id === opcodes.client.session || packet.id === opcodes.client.login) {
            console.warn(`loggedIn: ${session} invalid packet => ${packet.id}`)
        } else {
            await handlePacket(session, packet)
        }
    },
    invalid: async (session, packet) => {
        console.log(`got packet ${packet.id} from ${session} with invalid state`)
    }
}

console.log(`exporting: ${JSON.stringify(SessionState)}`)

module.exports = SessionState
