const SessionState = require('./session-state')
const decode = require('./packet/decoder')
const events = require('events')
const senders = require('./senders')
const state = require('state')
const uuid = require('uuid/v4')

class Session extends events.EventEmitter {
    constructor(server, socket) {
        super()
        this.server = server
        this.socket = socket

        this.send = senders(this)

        this.addListeners();
        this.generateIdentifier()

        state(this, SessionState)

        this.state().change('SessionRequest')

        this.packet = {
            state: 0,
            position: 0
        }

        const timeout = server.config.server['session-timeout'];

        if (timeout) {
            this.socket.setTimeout(timeout)
        }
    }

    addListeners() {
        this.socket.on('error', err => this.emit('error', err))
        this.socket.on('close', () => this.emit('disconnect'))
        this.socket.on('timeout', () => this.emit('timeout'))

        this.socket.on('data', data => {
            try {
                decode(this, data)
            } catch (e) {
                this.close()
                this.emit('error', e)
            }
        })

        this.on('packet', async () => {
            try {
                await this.handlePacket(this, this.packet)
            } catch (e) {
                console.warn('error handling packet', e)
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
            this.socket.write(data, err => {
                if (err) {
                    reject(err)
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
        return `session[${this.identifier}][${this.state().name}]`
    }
}

module.exports = Session
