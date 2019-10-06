const Entity = require('./entity')
const PlayerStatus = require('./player-status')
const Position = require('../world/position')

class Player extends Entity {
    constructor(session, profile) {
        super()
        this.session = session
        this.username = profile.username
        this.password = profile.password
        this.status = new PlayerStatus(profile.status)
        this.position = new Position(profile.x, profile.y)
    }
}

module.exports = Player
