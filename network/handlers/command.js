/* eslint-disable complexity */
/* eslint-disable max-depth */
/* eslint-disable no-trailing-spaces */
const commandHandlers = require('./command-handlers')

module.exports.name = 'command'

module.exports.handle = (session, buffer) => new Promise((resolve, reject) => {
    const [command, ...args] = buffer.toString().split(' ')

    const handler = commandHandlers.get(command.toLowerCase())

    if (handler) {
        handler(session.player, ...args)
    } else {
        session.send.message(`invalid command: ${command.toLowerCase()}`)
    }
    resolve()
})

module.exports.handleOld = (session, buffer) => new Promise((resolve, reject) => {
    const [command, ...args] = buffer.toString().split(' ')

    try {
        switch (command.toLowerCase()) {
            case 'inst': {
                const players = session.player.instance.playerTree.getAllPoints()
                session.send.serverMessage(players.map(p => p.username).join(', '))
            } break
            case 'newinst': {
                const instance = new Instance(session.server, true)
                instance.name = args[0]
                session.send.message(`instance ${instance.name} created.`)
            } break
            case 'joininst': {
                const instances = session.server.instances
                const player = session.server.findPlayer(args[0])
                
                if (!player) {
                    session.session.send.message(`could not find player ${args[0]}`)
                    return
                }

                if (args[1] === 'world') {
                    console.log(`sent ${args[0]} to global world`)
                    player.instance.removePlayer(player)
                    session.server.world.addPlayer(player)
                } else {
                    for (const instance of instances[Symbol.iterator]()) {
                        if (instance.name && instance.name === args[1]) {
                            console.log(`found instance... adding player`)
                            player.instance.removePlayer(player)
                            instance.addPlayer(player)
                            break
                        }
                    }
                    console.log(`did not find inst?`)
                }
            } break
            case 'listinst': {
                let msg = ''
                session.server.instances.forEach(instance => {
                    msg += instance.name ? `@yel@${instance.name}[@whi@${instance.players.size}@yel@]@whi@, ` : `@yel@World[@whi@${session.server.world.players.size}@yel@]@whi@, `
                })
                session.send.serverMessage(msg.substr(0, msg.length - 2))
            } break
            case 'env': {
                const inst = `@yel@Instance: @whi@${session.player.instance.name} [${session.player.instance.players.size}]`
                let view = '@yel@View: @red@[@whi@'
                for (const p of session.player.players.known) {
                    view += `${p.username}, `
                }
                view = view.substr(0, view.length - 2)
                view += '@red@]'

                session.send.serverMessage(`@gre@Environment Information % % ${inst} % ${view}`)
            } break
            case 'tele': {
                const [x, y] = args
                session.player.position = new Position(+x, +y)
            } break
            case 'emit':
                session.player.emit(...args)
                break
            case 'action': {
                const player = session.server.findPlayer(args[0])

                if (player) {
                    player.emit('overhead-action', +args[1])
                    session.send.message(`sent ${args[1]} action to ${args[0]}`)
                }
            } break
            case 'damage': {
                const player = session.server.findPlayer(args[0])

                if (player) {
                    player.emit('damage', +args[1])
                    session.send.message(`sent ${args[1]} damage to ${args[0]}`)
                }
            } break
            case 'skull': {
                const player = session.server.findPlayer(args[0])

                if (player) {
                    player.skulled = +args[1]
                    session.send.message(`skulled ${args[0]} for ${args[1]} ticks`)
                }
            } break
        }
        resolve()
    } catch (error) {
        session.send.message(`error: ${error.message}`)
        reject()
    }
})
