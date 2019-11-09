const Indexer = require('../operations/indexer')
const Instance = require('../model/world/instance')
const Session = require('./session')
const events = require('events')
const net = require('net')

const DEFAULT_OPTIONS = {
    host: '0.0.0.0',
    port: 43594
}

function connectionListener(server, socket) {
    const session = new Session(server, socket)

    while (server.sessions.get(session.identifier)) {
        session.generateIdentifier()
    }

    session.on('error', e => {
        e.code = 'ERR_SESSION';
        e.session = session;
        e.message = `${session} ${e.message}`;
        server.emit('error', e);
    })

    session.on('disconnect', () => {
        server.sessions.delete(session.identifier)
        server.emit('session-disconnect', session)
    })

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
                const options = { ...DEFAULT_OPTIONS, ...this.config.server }

                this.socket.listen(options.port, options.host, resolve)
            } catch (e) {
                reject(e)
            }
        })
    }

    async unbind() {
        return new Promise((resolve, reject) => {
            try {
                this.socket.close(resolve)
            } catch (e) {
                reject(e)
            }
        })
    }

    // attempts to find the Instance with `name` in this.instances,
    // if not, return the global instance
    findInstance(name) {
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
