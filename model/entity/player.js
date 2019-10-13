const Character = require('./character')
const EntityTracker = require('./entity-tracker')
const PlayerStatus = require('./player-status')
const PlayerUpdate = require('./player-update')
const Position = require('../world/position')
const Username = require('../../operations/username')
const addPlayerListeners = require('./player-listeners')

const DEFUALT_VIEW_DISTANCE = 15

class Player extends Character {
    constructor(session, profile) {
        super()
        this.index = session.server.playerIndex.request()
        this.session = session
        this.username = profile.username
        this.usernameHash = Username.encode(profile.username)
        this.status = new PlayerStatus(profile.status)
        this.position = new Position(profile.x, profile.y)

        this.viewDistance = DEFUALT_VIEW_DISTANCE
        this.players = new EntityTracker()
        this.playerUpdates = new PlayerUpdate()

        addPlayerListeners(this)
    }
    update() {
        this.session.send.regionPlayers()
        this.session.send.regionPlayerUpdate()
    }
    toString() {
        return this.index
    }
}

module.exports = Player
