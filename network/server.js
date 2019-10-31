const events = require('events')
const net = require('net')
const Session = require('./session')
const Instance = require('../model/world/instance')
const Indexer = require('../operations/indexer')

// TODO: this might could use some cleaning up, but it's ok for now.

function connectionListener(server, socket) {
    const session = new Session(server, socket)

    while (server.sessions.get(session.identifier)) {
        session.generateIdentifier()
    }

    socket.on('close', () => {
        session.emit('disconnect')

        server.sessions.delete(session.identifier)
        server.emit('session-disconnect', session)
    })
    socket.on('error', error => {
        try {
            session.emit('error', error)
            server.emit('session-error', session, error)
        } catch (e) {
            console.log(e)
        }
    })
    socket.on('timeout', () => {
        session.emit('timeout')
        server.emit('session-timeout', session)
    })

    const timeout = server.config.server['session-timeout']

    if (timeout) {
        socket.setTimeout(timeout)
    }

    server.sessions.set(session.identifier, session)
    server.emit('session-connect', session)
    session.emit('connect')
}

function gameTick(server) {
    for (const instance of server.instances) {
        instance.update()
    }

    setTimeout(server.gameTicker, 600)
}

class Server extends events.EventEmitter {
    constructor(config) {
        super()

        const listener = connectionListener.bind(null, this)

        this.config = config
        this.socket = net.createServer(listener)
        this.sessions = new Map()
        this.instances = new Set()
        this.world = new Instance(this, 'GLOBAL_INSTANCE', false)
        this.playerIndex = new Indexer()
        this.objectIndex = new Indexer()

        this.gameTicker = gameTick.bind(null, this)

        // this should stop when the server goes offline.
        setTimeout(this.gameTicker, 600)
    }
    async bind() {
        return new Promise((resolve, reject) => {
            try {
                const defaultOptions = {
                    host: "0.0.0.0",
                    port: 43594
                }
                const options = { ...defaultOptions, ...this.config.server }

                this.socket.listen(options.port, options.host, resolve)
            } catch (error) {
                reject(error)
            }
        })
    }
    async unbind() {
        return new Promise((resolve, reject) => {
            try {
                this.socket.close(resolve)
            } catch (error) {
                reject(error)
            }
        })
    }
    findInstance(name) {
        // attempts to find the Instance with `name` in this.instances,
        // if not, return the global instance
        for (const instance of this.instances) {
            if (instance.name === name) {
                return instance
            }
        }
        return this.world
    }
    findPlayer(username) {
        username = username.toLowerCase()

        for (const instance of this.instances) {
            for (const player of instance.players) {
                if (player.username.toLowerCase() === username) {
                    return player
                }
            }
        }
        return null
    }
    *allPlayers() {
        for (const instance of this.instances) {
            for (const player of instance.players) {
                yield player
            }
        }
    }
}

module.exports = Server
