const Encoder = require('../packet/encoder')

module.exports.name = 'region-objects'

module.exports.send = (session, id, position) => {
    const objects = session.player.gameObjects
    const packet = new Encoder(id)

    for (const object of objects.removedObjects) {
        const { x: dx, y: dy } = position.offsetFrom(object.position)

        packet.addShort(60000)
        packet.addByte(dx).addByte(dy)

        objects.acknowledge(object)

        if (packet.caret >= 4900) {
            // the packet can be a maximum of up to 5000 bytes (including the
            // header) but we will stop at the arbitrarily chosen 4900.
            session.write(packet.build())

            // emit the object position packet again
            return session.player.emit('game-object-position')
        }
    }

    for (const object of objects.newObjects) {
        const { x: dx, y: dy } = position.offsetFrom(object.position)

        packet.addShort(object.objectId)
        packet.addByte(dx).addByte(dy)

        objects.acknowledge(object)

        if (packet.caret >= 4900) {
            // the packet can be a maximum of up to 5000 bytes (including the
            // header) but we will stop at the arbitrarily chosen 4900.
            session.write(packet.build())

            // emit the object position packet again
            return session.player.emit('game-object-position')
        }
    }

    session.write(packet.build())
}
