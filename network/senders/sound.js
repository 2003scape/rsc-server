const Encoder = require('../packet/encoder')

module.exports = (session, id, soundName) => {
    const packet = new Encoder(id)
    packet.addString(soundName)
    session.write(packet.build())
};
