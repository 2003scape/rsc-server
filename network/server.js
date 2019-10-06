const config = require('../config')
const EventEmitter = require('events').EventEmitter
const net = require('net')
const Session = require('./session')
const IndexOgranizer = require('../world/index-organizer')
const World = require('../world/world')

function handleNewSession(server, socket) {
    const session = new Session(server, socket)

    session.on('close', () => {
        server.sessions.delete(session.identifier)
        server.emit('session-disconnected', session)
    })
    session.on('error', error => server.emit('session-error', session, error))
    session.on('timeout', () => server.emit('session-timeout', session))

    // ensure that, by chance, this session's id isn't already in use
    while (server.sessions.get(session.identifier)) {
        session.generateIdentifier()
    }

    server.sessions.set(session.identifier, session)
    server.emit('session-connected', session)
}

function registerEntity(entity, indexer, register) {
    const added = register(entity)

    if (added) {
        entity.index = indexer.request()

        entity.emit('registered')
    }

    return added
}

function deregisterEntity(entity, indexer, deregister) {
    if (entity.index) {
        indexer.release(entity.index)
        delete entity.index

        entity.emit('deregistered')
    }
    deregister(entity)
}

class Server extends EventEmitter {
    constructor(maxConnections = 0) {
        super()
        this.maxConnections = maxConnections
        this.sessions = new Map()

        this.playerIndex = new IndexOgranizer()
        this.npcIndex = new IndexOgranizer()
        this.objectIndex = new IndexOgranizer()

        this.world = new World(config.world)
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

    // TODO: should we set an attribute in each entity to whichever
    // TODO: instance they're in? this could reduce bugs later on..

    addPlayer(player) {
        // TODO: maybe put staff in their own instance upon login?
        // TODO: but for now, everyone gets put inside the default instance..
        return registerEntity(player, this.playerIndex,
            this.world.addPlayer.bind(this.world))
    }

    removePlayer(player) {
        deregisterEntity(player, this.playerIndex,
            this.world.removePlayer.bind(this.world))
    }

    addNpc(npc, instance = this.world) {
        return registerEntity(npc, this.npcIndex,
            instance.addNpc.bind(instance))
    }

    removeNpc(npc, instance = this.world) {
        deregisterEntity(npc, this.npcIndex,
            instance.removeNpc.bind(instance))
    }

    addObject(object, instance = this.world) {
        return registerEntity(object, this.objectIndex,
            instance.addObject.bind(instance))
    }

    removeObject(object, instance = this.world) {
        deregisterEntity(object, this.objectIndex,
            instance.removeObject.bind(instance))
    }

    [Symbol.iterator]() {
        return this.sessions.values()
    }
}

module.exports = Server
