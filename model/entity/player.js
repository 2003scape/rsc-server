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

        this.mskulled = 0

        addPlayerListeners(this)
    }
    get skulled() {
        return this.mskulled
    }
    set skulled(newSkulled) {
        this.mskulled = newSkulled
        this.emit('appearance')
    }

    update() {
        this.updateSkullTimeout()

        this.session.send.regionPlayers()
        this.session.send.regionPlayerUpdate()
    }
    updateSkullTimeout() {
        if (this.mskulled > 0) {
            this.mskulled -= 1

            // player became unskulled
            if (this.mskulled == 0) {
                this.emit('appearance')
            }
        }
    }
}

module.exports = Player
