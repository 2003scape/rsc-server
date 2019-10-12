const Entity = require('./entity')
const EntityTracker = require('./entity-tracker')
const PlayerStatus = require('./player-status')
const Position = require('../world/position')
const addPlayerListeners = require('./player-listeners')

const DEFUALT_VIEW_DISTANCE = 15

class Player extends Entity {
    constructor(session, profile) {
        super()
        this.index = session.server.playerIndex.request()
        this.session = session
        this.username = profile.username
        this.status = new PlayerStatus(profile.status)
        this.position = new Position(profile.x, profile.y)

        this.viewDistance = DEFUALT_VIEW_DISTANCE
        this.players = new EntityTracker()

        addPlayerListeners(this)
    }
    update() {
        this.session.send.regionPlayers()
    }
    toString() {
        return this.index
    }
}

module.exports = Player
