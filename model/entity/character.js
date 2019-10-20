const Entity = require('./entity')
const Position = require('../world/position')

class Character extends Entity {
    constructor() {
        super()
        this.spriteChanges = 0

        this.level = 3
        this.msprites = [1, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        this.appearance = {
            hairColor: 2,
            topColor: 8,
            legColor: 14,
            skinColor: 0
        }

        this.walkQueue = []
    }
    get sprites() {
        return this.msprites
    }
    set sprites(newSprites) {
        const oldSprites = this.msprites
        this.msprites = newSprites
        this.spriteChanges += 1

        this.emit('appearance', oldSprites, newSprites)
    }
    move(x, y) {
        this.position = new Position(this.x + x, this.y + y)
    }
    update() {
        if (this.walkQueue.length > 0) {
            const { x: dx, y: dy } = this.walkQueue.shift()
            this.move(dx, dy)
        }
    }
}

module.exports = Character
