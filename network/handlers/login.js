const Player = require('../../model/entity/player')
const PlayerRank = require('../../model/entity/player-rank')

const responses = {
    SERVER_REJECT: 8,
    LOGINSERVER_REJECT: 9
};

function emulateDataServer(request) {
    return {
        profile: {
            username: request.username,
            password: request.password,
            rank: PlayerRank.ADMIN,
            x: 122,
            y: 657
        },
        code: 25
    }
}

module.exports = async (session, buffer) => {
    try {
        const request = {
            reconnecting: buffer.readInt8() !== 0,
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

        const response = emulateDataServer(request)

        session.state().change('LoggedIn')
        session.write(Buffer.from([response.code & 0xFF]))

        session.player = new Player(session, response.profile)
        session.server.world.addPlayer(session.player)
        session.player.emit('login')
    } catch (e) {
        session.state().change('Invalid')
        session.write(Buffer.from([responses.SERVER_REJECT]))

        throw new Error(`login rejected ${e}`)
    }
}
