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
    destroy() {
        playerIndexTracker.release(this.index)
        this.index = -1
        if (this.instance) {
            this.instance.removePlayer(this)
        }
        this.session.close()
    }
    update() {
        console.log(`updating player: ${this}`)

        // update after having sent the position packet
        this.players.update()
    }
    toString() {
        return `player[${this.username}, ${this.index}]`
    }
}

module.exports = Player
