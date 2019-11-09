const config = require('../../config')
const Encoder = require('../packet/encoder')

function elevation(player) {
    return ~~(player.position.y / config.world['plane-elevation-divisor'])
}

module.exports = (session, id) => {
    const packet = new Encoder(id)

    packet.addShort(session.player.index)
    packet.addShort(config.world['plane-width'])
    packet.addShort(config.world['plane-height'])
    packet.addShort(elevation(session.player))
    packet.addShort(config.world['plane-elevation-divisor'])

    session.write(packet.build())
}
