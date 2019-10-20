const Instance = require('./instance')

class World extends Instance {
    constructor(server) {
        super(server, 'GLOBAL WORLD', false)
    }
}

module.exports = World
