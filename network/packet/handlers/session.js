const SmartBuffer = require('smart-buffer').SmartBuffer

// TODO: this should be requested from the gateway server

function secureInt() {
    return ~~(Math.random() * 0xFFFFFFFF)
}

module.exports.name = 'session'

module.exports.handle = (session, payload) => new Promise((resolve, reject) => {
    const packet = SmartBuffer.fromBuffer(payload)
    const response = new SmartBuffer()

    try {
        session.keys = [packet.readInt8(), secureInt()]

        response.writeInt32BE(session.keys[0])
        response.writeInt32BE(session.keys[1])

        session.advanceState()
        session.write(response.toBuffer())
        resolve()
    } catch (error) {
        session.invalidateState()
        reject(error)
    }
})
