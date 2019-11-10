const Indexer = require('../operations/indexer')
const Instance = require('../model/world/instance')
const Session = require('./session')
const WebSocket = require('ws')
const events = require('events')
const net = require('net')

const DEFAULT_TCP_OPTIONS = {
    host: '0.0.0.0',
    port: 43594
}

const DEFAULT_WS_OPTIONS = {
    host: '0.0.0.0',
    port: 43595
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

    if (server.running) {
        setTimeout(server.gameTicker, 600)
    }
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

        this.running = false
        this.gameTicker = gameTick.bind(null, this)
    }

    async bindTcp() {
        return new Promise((resolve, reject) => {
            const options = { ...DEFAULT_TCP_OPTIONS, ...this.config.server }

            this.socket.once('error', reject)

            this.socket.listen(options.port, options.host, () => {
                this.socket.on('error', err => {
                    this.running = false
                    this.emit('error', err)
                })

                resolve()
            })
        })
    }

    async unbindTcp() {
        return new Promise((resolve, reject) => {
            // we're not listening already
            if (!this.socket.address()) {
                return resolve()
            }

            this.socket.close(err => {
                if (err) {
                    return reject(err)
                }

                resolve()
            })
        })
    }

    async bindWebsocket() {
        return new Promise((resolve, reject) => {
            const options = { ...DEFAULT_WS_OPTIONS,
                ...this.config.websocketServer }

            this.websocket = new WebSocket.Server(options)

            this.websocket.once('error', reject)

            this.websocket.once('listening', () => {
                this.websocket.on('error', err => {
                    this.running = false
                    this.emit('error', err)
                })

                resolve()
            })

            const listener = connectionListener.bind(null, this)

            this.websocket.on('connection', listener)
        })
    }

    async unbindWebsocket() {
        if (!this.websocket.address()) {
            return
        }

        this.websocket.close()
    }

    async start() {
        try {
            await this.bindTcp()

            if (this.config.websocketServer.port > 0) {
                await this.bindWebsocket()
            }
        } catch (e) {
            await this.unbindTcp()
            await this.unbindWebsocket()

            throw e
        }

        this.running = true
        setTimeout(this.gameTicker, 600)
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
