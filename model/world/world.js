const Instance = require('./instance')

class World extends Instance {
    constructor(server) {
        super(server, false)
    }
}

module.exports = World
