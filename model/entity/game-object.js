const Entity = require('./entity')
const Position = require('../world/position')
const defs = require('../../definitions')
const addGameObjectListeners = require('./game-object-listeners')

class GameObject extends Entity {
    constructor(server, { id, position, direction }) {
        super()
        this.index = server.objectIndex.request()
        this.objectId = id
        this.position = new Position(position[0], position[1])
        this.direction = direction

        this.def = defs.objects[id]

        addGameObjectListeners(this)
    }
}

module.exports = GameObject
