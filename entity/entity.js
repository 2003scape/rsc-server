const EventEmitter = require('events').EventEmitter
const Position = require('../world/position')
const direction = require('./direction')

const DEFAULT_POSITION = new Position(122, 657);
const DEFAULT_DIRECTION = direction.north

class Entity extends EventEmitter {
    constructor(index) {
        super()
        this.id = index
        this.pos = DEFAULT_POSITION
        this.dir = DEFAULT_DIRECTION
    }
    get index() {
        return this.id
    }
    set index(newIndex) {
        const oldIndex = this.id
        this.id = newIndex

        this.emit('index', oldIndex, newIndex)
    }

    get position() {
        return this.pos
    }
    set position(newPosition) {
        const oldPosition = this.pos
        this.pos = newPosition

        this.emit('position', oldPosition, newPosition)
    }

    get direction() {
        return this.dir
    }
    set direction(newDirection) {
        const oldDirection = this.dir
        this.dir = newDirection

        this.emit('direction', oldDirection, newDirection)
    }
}

module.exports = Entity
