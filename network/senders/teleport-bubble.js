const Encoder = require('../packet/encoder')

module.exports.name = 'teleport-bubble'

module.exports.send = (session, id, largeBubble, position) => {
    const packet = new Encoder(id)
    const { x: dx, y: dy } = session.player.position.offsetFrom(position)

    packet.addBoolean(largeBubble)

    packet.addByte(dx)
        .addByte(dy)

    session.write(packet.build())
}
