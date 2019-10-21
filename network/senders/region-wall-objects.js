const Encoder = require('../packet/encoder')

module.exports.name = 'region-wall-objects'

module.exports.send = (session, id) => {
    const player = session.player
    const packet = new Encoder(id)

    for (const object of player.wallObjects.newObjects) {
        const { x: dx, y: dy } = player.position.offsetFrom(object.position)

        packet.addShort(object.objectId)
        packet.addByte(dx).addByte(dy)
        packet.addByte(object.direction)
    }

    for (const object of player.wallObjects.removedObjects) {
        const { x: dx, y: dy } = player.position.offsetFrom(object.position)

        packet.addShort(65535)
        packet.addByte(dx).addByte(dy)
        packet.addByte(object.direction)
    }

    player.gameObjects.update()
    session.write(packet.build())
}
