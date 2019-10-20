const Entity = require('./entity')
const Position = require('../world/position')
const defs = require('../../definitions')

class GameObject extends Entity {
    constructor({ id, position, direction }) {
        super()
        this.objectId = id
        this.position = new Position(position[0], position[1])
        this.direction = direction

        this.def = defs.objects[id]
    }
}

module.exports = GameObject
