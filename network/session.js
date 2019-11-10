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
        this.isWebsocket = this.socket.constructor.name === 'WebSocket'

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

        if (timeout && !this.isWebsocket) {
            this.socket.setTimeout(timeout)
        }
    }

    addListeners() {
        const onData = data => {
            try {
                decode(this, data)
            } catch (e) {
                this.close()
                this.emit('error', e)
            }
        }

        this.socket.on('error', err => this.emit('error', err))
        this.socket.on('close', () => this.emit('disconnect'))

        if (this.isWebsocket) {
            this.socket.on('message', onData)
        } else {
            this.socket.on('timeout', () => this.emit('timeout'))
            this.socket.on('data', onData)
        }

        this.on('packet', async () => {
            try {
                await this.handlePacket(this, this.packet)
            } catch (e) {
                console.warn('error handling packet', e)
            }
        })
    }

    close() {
        if (this.isWebsocket) {
            this.socket.terminate()
        } else {
            this.socket.destroy()
        }
    }

    writeTcp(data) {
        if (this.socket.destroyed) {
            this.emit('error', new Error('writing to destroyed socket'))
            return
        }

        this.socket.write(data)
    }

    writeWebsocket(data) {
        const readyState = this.socket.readyState;

        if (readyState !== 1) {
            this.emit('error', new Error(`invalid readyState ${readyState}`))
            return
        }

        this.socket.send(data, { compress: false, binary: true })
    }

    write(data) {
        if (this.isWebsocket) {
            this.writeWebsocket(data)
        } else {
            this.writeTcp(data)
        }
    }

    generateIdentifier() {
        this.identifier = uuid()
    }

    toString() {
        return `session[${this.identifier}][${this.state().name}]`
    }
}

module.exports = Session
