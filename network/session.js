const config = require('./../config')

const EventEmitter = require('events').EventEmitter
const uuid = require('uuid/v4')

const decode = require('./packet/decoder')
const handlers = require('./packet/handlers')
const senders = require('./packet/senders')
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
        if (packet.id === opcodes.client.session) {
            return await handlePacket(session, packet)
        }
        console.warn(`awaitingSessionRequest: ${session} invalid packet => ${packet.id}`)
    },
    awaitingLogin: async (session, packet) => {
        if (packet.id === opcodes.client.login) {
            return await handlePacket(session, packet)
        }
        console.warn(`awaitingLogin: ${session} invalid packet => ${packet.id}`)
    },
    loggedIn: async (session, packet) => {
        if (packet.id !== opcodes.client.session && packet.id !== opcodes.client.login) {
            return await handlePacket(session, packet)
        }
        console.warn(`loggedIn: ${session} invalid packet => ${packet.id}`)
    },
    invalid: async (session, packet) => {
        console.log(`got packet ${packet.id} from ${session} with invalid state`)
    }
}

function attachListeners(session) {
    session.socket.on('close', () => session.emit('close'))
    session.socket.on('error', error => session.emit('error', error))
    session.socket.on('timeout', () => session.emit('timeout'))

    session.socket.on('data', async data => {
        const decoded = decode(data)

        console.log(`got packet: ${decoded.id}`)

        session.state(session, decoded)
    })

    if (config.session.timeout) {
        session.socket.setTimeout(config.session.timeout)
    }
}

class Session extends EventEmitter {
    constructor(server, socket) {
        super()

        this.server = server
        this.socket = socket
        this.state = SessionState.awaitingSessionRequest

        this.send = senders(this)

        this.generateIdentifier()

        attachListeners(this)
    }

    close() {
        this.socket.destroy()
    }

    async write(data) {
        return new Promise(resolve => this.socket.write(data, () => resolve))
    }

    generateIdentifier() {
        this.identifier = uuid()
    }

    advanceState() {
        switch (this.state) {
            case SessionState.awaitingSessionRequest:
                this.state = SessionState.awaitingLogin
                break
            case SessionState.awaitingLogin:
                this.state = SessionState.loggedIn
                break
        }
    }

    invalidateState() {
        this.state = SessionState.invalid
    }

    toString() {
        return `Session[${this.identifier}]`
    }
}

module.exports = Session
