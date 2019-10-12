// using getters is a good way to make a semi-immutable object, right?
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
        return Math.sqrt(Math.pow(this.mx + other.mx, 2) +
            Math.pow(this.my + other.my, 2))
    }
    offsetFrom(other) {
        return new Position(other.mx - this.mx, other.my - this.my)
    }
}

module.exports = Position
