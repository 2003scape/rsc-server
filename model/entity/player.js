const Character = require('./character')
const EntityPosition = require('./entity-position')
const PlayerStatus = require('./player-status')
const PlayerUpdate = require('./player-update')
const Position = require('../world/position')
const Username = require('../../operations/username')
const addPlayerListeners = require('./player-listeners')

const DEFAULT_VIEW_DISTANCE = 15

let offset = 0

class Player extends Character {
    constructor(session, profile) {
        super()
        this.index = session.server.playerIndex.request()
        this.session = session
        this.username = profile.username
        this.usernameHash = Username.encode(profile.username)
        this.status = new PlayerStatus(profile.status)
        this.position = new Position(profile.x, profile.y + offset++)

        this.viewDistance = DEFAULT_VIEW_DISTANCE
        this.players = new EntityPosition()
        this.playerUpdates = new PlayerUpdate()

        addPlayerListeners(this)
    }
    update() {
        if (this.players.unknown.size > 0) {
            console.log(`${this.username} has a new player in view.`)
        }
        this.session.send.regionPlayers()
        this.session.send.regionPlayerUpdate()
    }
    toString() {
        return this.index
    }
}

module.exports = Player
