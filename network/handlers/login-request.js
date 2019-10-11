const Player = require('../../model/entity/player')
const SmartBuffer = require('smart-buffer').SmartBuffer

async function emulateDataServer(request) {
    return new Promise((resolve, reject) => {
        if (Math.random() > 0.2) {
            resolve({
                profile: {
                    username: request.username,
                    password: request.password,
                    status: 0x4 | 0x2 | 0x1, // hack for admin priv..
                    x: 122,
                    y: 657
                },
                code: 25
            })
        } else {
            reject({
                reason: 'random reject',
                code: 11
            })
        }
    })
}

module.exports.name = 'login'

module.exports.handle = (session, buffer) => new Promise(async (resolve, reject) => {
    try {
        const request = {
            reconnecting: buffer.readInt8() == 1,
            version: buffer.readInt16BE(),
            limit30: buffer.readInt8(),
            const10: buffer.readInt8(),
            clientKeys: [
                buffer.readInt32BE(), buffer.readInt32BE(),
                buffer.readInt32BE(), buffer.readInt32BE()
            ],
            userId: buffer.readInt32BE(),
            username: buffer.readString(20).trim(),
            password: buffer.readString(20).trim()
        }
        try {
            const response = await emulateDataServer(request)

            session.state().change('LoggedIn')
            session.write(Buffer.from([response.code & 0xFF]))

            // we could add staff to a private instance upon login,
            // then have themselves manually move to the global
            // instance via command? maybe.
            session.player = new Player(session, response.profile)
            session.server.world.addPlayer(session.player)
            session.player.emit('login')
            resolve()
        } catch (badResponse) {
            session.state().change('Invalid')
            session.write(Buffer.from([badResponse.code & 0xFF]))
            reject(new Error(`Login rejected: ${badResponse}`))
        }
    } catch (error) {
        session.state().change('Invalid')
        reject(error)
    }
})
