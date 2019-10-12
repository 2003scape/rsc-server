const events = require('events')
const decode = require('./packet/decoder')
const senders = require('./senders')
const SessionState = require('./session-state')
const state = require('state')
const uuid = require('uuid/v4')

class Session extends events.EventEmitter {
    constructor(server, socket) {
        super()
        this.server = server
        this.socket = socket
        this.send = senders(this)
        this.generateIdentifier()

        state(this, SessionState)

        this.state().change('SessionRequest')

        this.socket.on('data', async data => {
            // TODO: buffer data, what if multiple packets are sent
            // within the same frame? for now, we can just ignore this,
            // but it needs to be implemented SOON.
            try {
                const packet = decode(data)

                this.handlePacket(this, packet)
            } catch (error) {
                this.close()
                console.error(error)
            }
        })
    }
    close() {
        this.socket.destroy()
    }
    async write(data) {
        return new Promise((resolve, reject) => {
            if (this.socket.destroyed) {
                return reject()
            }
            this.socket.write(data, error => {
                if (error) {
                    reject(error)
                } else {
                    resolve()
                }
            })
        })
    }
    generateIdentifier() {
        this.identifier = uuid()
    }
    toString() {
        return `session[${this.identifier}]`
    }
}

module.exports = Session
