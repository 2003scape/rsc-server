const EventEmitter = require('events').EventEmitter
const net = require('net')
const Session = require('./session')

function handleNewSession(server, socket) {
    const session = new Session(server, socket)

    session.on('close', () => {
        server.sessions.delete(session.identifier)
        server.emit('session-disconnected', session)
    })
    session.on('data', data => server.emit('session-data', session, data))
    session.on('error', error => server.emit('session-error', session, error))
    session.on('timeout', () => server.emit('session-timeout', session))

    // ensure that, by chance, this session's id isn't already in use
    while (server.sessions.get(session.identifier)) {
        session.generateIdentifier()
    }

    server.sessions.set(session.identifier, session)
    server.emit('session-connected', session)
}

class Server extends EventEmitter {
    constructor(maxConnections = 0) {
        super()
        this.maxConnections = maxConnections
        this.sessions = new Map()
    }
    async bind(port = 1234, host = '0.0.0.0') {
        return new Promise((resolve, reject) => {
            if (this.server) {
                return reject('Server object already has been binded')
            }
            this.server = net.createServer(handleNewSession.bind(null, this))
            this.server.maxConnections = this.maxConnections
            this.server.listen(port, host, resolve)
        })
    }
    async unbind() {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                return reject('Server object has not already been binded')
            }
            this.server.close(error => {
                if (error) {
                    reject(error.message)
                } else {
                    resolve()
                }
            })
        })
    }
    [Symbol.iterator]() {
        return this.sessions.values()
    }
}

module.exports = Server
