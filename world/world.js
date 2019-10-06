const Instance = require('./instance')

class World extends Instance {
    constructor({ maximumPlayers, maximumNpcs, maximumObjects }) {
        super(maximumPlayers, maximumNpcs, maximumObjects)
    }
}

module.exports = World
