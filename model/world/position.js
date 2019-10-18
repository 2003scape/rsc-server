const Direction = require('../entity/direction')

const directions = [
    [Direction.SOUTH_WEST, Direction.WEST, Direction.NORTH_WEST],
    [Direction.SOUTH, null, Direction.NORTH],
    [Direction.SOUTH_EAST, Direction.EAST, Direction.NORTH_EAST]
]

const clamp = val => Math.max(-1, Math.min(val, 1))

class Position {
    constructor(x, y) {
        this.mx = x || 0
        this.my = y || 0
    }
    get x() {
        return this.mx
    }
    get y() {
        return this.my
    }
    distance(other) {
        return Math.sqrt(Math.pow(this.mx - other.mx, 2) +
            Math.pow(this.my - other.my, 2))
    }
    offsetFrom(other) {
        return new Position(other.mx - this.mx, other.my - this.my)
    }
    direction(other) {
        const [dx, dy] = [other.mx - this.mx, other.my - this.my]
        return directions[clamp(dx) + 1][clamp(dy) + 1]
    }
    toString() {
        return `[${this.mx}, ${this.my}]`
    }
}

module.exports = Position
