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

        this.packet = {
            state: 0,
            position: 0
        }

        this.socket.on('data', data => {
            try {
                decode(this, data)
            } catch (error) {
                this.close()
                console.error('error decoding message', error)
            }
        })

        this.on('packet', async () => {
            try {
                await this.handlePacket(this, this.packet)
            } catch (error) {
                console.warn('error handling packet', error)
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
