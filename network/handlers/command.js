const Position = require('../../model/world/position')

module.exports.name = 'command'

module.exports.handle = (session, buffer) => new Promise(async (resolve, reject) => {
    const [command, ...args] = buffer.toString().split(' ')

    try {
        switch (command.toLowerCase()) {
            case 'tele':
                const [x, y] = args
                session.player.position = new Position(+x, +y)
                break
            case 'emit':
                session.player.emit(...args)
                break
        }
        resolve()
    } catch (error) {
        session.send.message(`error: ${error.message}`)
        reject()
    }
})
