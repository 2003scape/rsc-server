const GameObject = require('../model/entity/game-object')
const objectLocations = require('./game-object')
const wallDecorLocations = require('./wall-decoration')

module.exports.initialize = server => {
    for (const location of objectLocations) {
        server.world.addObject(new GameObject(location))
    }
    for (const location of wallDecorLocations) {
        server.world.addWallDecoration(new GameObject(location))
    }
}
