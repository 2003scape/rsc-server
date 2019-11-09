const Encoder = require('../packet/encoder')

module.exports = (session, id, position) => {
    const player = session.player
    const packet = new Encoder(id)

    for (const object of player.wallObjects.removedObjects) {
        const { x: dx, y: dy } = position.offsetFrom(object.position)

        packet.addShort(255)
        packet.addByte(dx).addByte(dy)
    }

    for (const object of player.wallObjects.newObjects) {
        const { x: dx, y: dy } = position.offsetFrom(object.position)

        packet.addShort(object.objectId)
        packet.addByte(dx).addByte(dy)
        packet.addByte(object.direction)
    }

    player.gameObjects.update()
    session.write(packet.build())
}
