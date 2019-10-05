const Entity = require('./entity')
const Position = require('../world/position')

class Player extends Entity {
    constructor(index, x, y) {
        super(index)
        this.position = new Position(x, y)
    }
}

module.exports = Player
