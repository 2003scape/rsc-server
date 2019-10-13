const Entity = require('./entity')

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
    }
    get sprites() {
        return this.msprites
    }
    set sprites(newAppearance) {
        const oldAppearance = this.mappearance
        this.msprites = newAppearance
        this.spriteChanges += 1

        this.emit('sprites', oldAppearance, newAppearance)
    }
}

module.exports = Character
