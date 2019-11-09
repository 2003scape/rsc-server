const Encoder = require('../packet/encoder')

module.exports = (session, id) => {
    const packet = new Encoder(id)
    session.write(packet.build())
}
