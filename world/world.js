const Instance = require('./instance')
const IndexOrganizer = require('./index-organizer')
const Player = require('../entity/player')

class World extends Instance {
    constructor({ maximumPlayers, maximumNpcs, maximumObjects }) {
        super(maximumPlayers, maximumNpcs, maximumObjects)
        this.playerIndex = new IndexOrganizer()
        this.npcIndex = new IndexOrganizer()
        this.objectIndex = new IndexOrganizer()
    }
}

module.exports = World
