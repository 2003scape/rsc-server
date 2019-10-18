const Encoder = require('../packet/encoder')

module.exports.name = 'player-died'

module.exports.send = (session, id) => {
    const packet = new Encoder(id)

    session.write(packet.build())
}
