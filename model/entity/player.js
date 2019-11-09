const Character = require('./character')
const EntityPosition = require('./entity-position') // rename
const GameObjectPotisionUpdater =
    require('./player-update/game-object-position')
const PlayerRank = require('./player-rank')
const PlayerUpdate = require('./player-update')
const Position = require('../world/position')
const Username = require('../../operations/username')
const addPlayerListeners = require('./player-listeners')

const DEFAULT_VIEW_DISTANCE = 15

class Player extends Character {
    constructor(session, profile) {
        super()

        this.index = session.server.playerIndex.request()
        this.session = session
        this.username = profile.username
        this.usernameHash = Username.encode(profile.username)
        this.rank = new PlayerRank(profile.rank)
        this.position = new Position(profile.x, profile.y)

        this.send = session.send

        this.viewDistance = DEFAULT_VIEW_DISTANCE
        this.players = new EntityPosition()
        this.playerUpdates = new PlayerUpdate()

        this.gameObjects = new GameObjectPotisionUpdater()
        this.wallObjects = new GameObjectPotisionUpdater()

        this.mskulled = 0

        this.region = { x: 0, y: 0 }

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
        super.update()

        this.updateSkullTimeout()

        this.send.regionPlayers()
        this.send.regionPlayerUpdate()
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
