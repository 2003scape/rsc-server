const config = require('./../config')

const EventEmitter = require('events').EventEmitter
const uuid = require('uuid/v4')

const SessionState = require('./session-state')

const decode = require('./packet/decoder')
const senders = require('./packet/senders')

function attachListeners(session) {
    session.socket.on('close', () => session.emit('close'))
    session.socket.on('data', data => session.emit('data', data))
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
        if (!this.socket.destroyed) {
            this.socket.destroy()
        }
    }

    async write(data) {
        console.log('writing data: ' + JSON.stringify(data.toJSON()))
        return new Promise(resolve => this.socket.write(data, () => resolve))
    }

    generateIdentifier() {
        this.identifier = uuid()
    }

    toString() {
        return `Session[${this.identifier}]`
    }
}

module.exports = Session
