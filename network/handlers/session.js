const { SmartBuffer } = require('smart-buffer')

function secureInt() {
    return ~~(Math.random() * 0xFFFFFFFF)
}

module.exports = async session => {
    const response = SmartBuffer.fromSize(8)

    try {
        // what if we based this off the session identifier instead of 'secure'
        // random integers?
        session.isaac = {
            keys: {
                in: [],
                out: [secureInt(), secureInt()]
            }
        }

        // there's a byte in the buffer that is not being read, it is based off
        // the username hash and not really needed

        // the "session id," as its called in the client, is actually the isaac
        // seed for the client's incoming packets.
        response.writeInt32BE(session.isaac.keys.out[0])
        response.writeInt32BE(session.isaac.keys.out[1])

        session.state().change('LoginRequest')
        session.write(response.toBuffer())
    } catch (e) {
        session.state().change('Invalid')
        throw e
    }
}
