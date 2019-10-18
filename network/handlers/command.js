const Position = require('../../model/world/position')

module.exports.name = 'command'

module.exports.handle = (session, buffer) => new Promise((resolve, reject) => {
    const [command, ...args] = buffer.toString().split(' ')

    try {
        switch (command.toLowerCase()) {
            case 'sysmsg': {
                const msg = `SYSTEM MESSAGE: @whi@${args.join(' ')}`

                for (const player of session.server.allPlayers()) {
                    player.session.send.message(`@red@${msg}`)
                    player.session.send.message(`@yel@${msg}`)
                    player.session.send.message(`@gre@${msg}`)
                    player.session.send.message(`@cya@${msg}`)
                }
            }
                break
            case 'tele': {
                const [x, y] = args
                session.player.position = new Position(+x, +y)
            }
                break
            case 'emit':
                session.player.emit(...args)
                break
            case 'a':
                session.player.position = new Position(session.player.position.x + 1, session.player.position.y)
                break
            case 'action': {
                const player = session.server.findPlayer(args[0])

                if (player) {
                    player.emit('overhead-action', +args[1])
                    session.send.message(`sent ${args[1]} action to ${args[0]}`)
                }
            }
                break
            case 'damage': {
                const player = session.server.findPlayer(args[0])

                if (player) {
                    player.emit('damage', +args[1])
                    session.send.message(`sent ${args[1]} damage to ${args[0]}`)
                }
            }
                break
        }
        resolve()
    } catch (error) {
        session.send.message(`error: ${error.message}`)
        reject()
    }
})
