const Encoder = require('../packet/encoder')

module.exports = (session, id, message) => {
    const packet = new Encoder(id)
    packet.addString(message)
    session.write(packet.build())
}
