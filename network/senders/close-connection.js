const Encoder = require('../packet/encoder')

module.exports.name = 'close-connection'

module.exports.send = (session, id) => {
    const packet = new Encoder(id)

    session.write(packet.build())
}
