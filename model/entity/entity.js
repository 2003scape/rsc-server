const EventEmitter = require('events').EventEmitter
const Position = require('../world/position')
const Direction = require('./direction')

const DEFAULT_POSITION = new Position(122, 657)
const DEFAULT_DIRECTION = Direction.NORTH

class Entity extends EventEmitter {
    constructor() {
        super()
        this.id = -1
        this.pos = DEFAULT_POSITION
        this.dir = DEFAULT_DIRECTION
        this.currentInstance = null
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

    get x() {
        return this.pos.x
    }
    get y() {
        return this.pos.y
    }

    set x(newX) {
        this.position = new Position(newX, this.pos.y)
    }
    set y(newY) {
        this.position = new Position(this.pos.y, newY)
    }

    get direction() {
        return this.dir
    }
    set direction(newDirection) {
        const oldDirection = this.dir
        this.dir = newDirection

        this.emit('direction', oldDirection, newDirection)
    }

    get instance() {
        return this.currentInstance
    }
    set instance(newInstance) {
        const oldInstance = this.currentInstance
        this.currentInstance = newInstance

        this.emit('instance', oldInstance, newInstance)
    }
}

module.exports = Entity
