const Encoder = require('../packet/encoder')

module.exports.name = 'region-objects'

module.exports.send = (session, id, position) => {
    const player = session.player
    const packet = new Encoder(id)

    for (const object of player.gameObjects.removedObjects) {
        const { x: dx, y: dy } = position.offsetFrom(object.position)

        packet.addShort(60000)
        packet.addByte(dx).addByte(dy)
    }

    for (const object of player.gameObjects.newObjects) {
        const { x: dx, y: dy } = position.offsetFrom(object.position)

        packet.addShort(object.objectId)
        packet.addByte(dx).addByte(dy)
    }

    player.gameObjects.update()
    session.write(packet.build())
}
