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
}

module.exports = Position
