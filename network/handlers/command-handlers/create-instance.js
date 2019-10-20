const Instance = require('../../../model/world/instance')

module.exports.name = 'newinst'

module.exports.handle = (player, name, join) => {
    if (!name) {
        return player.send.message('command requires instance name')
    }

    // check if an instance w/ the requested name already exists
    for (const instance of player.session.server.instances) {
        if (instance.name === name) {
            return player.send.message('an instance with the same name already exists')
        }
    }

    const instance = new Instance(player.session.server, name, true)

    player.send.message(`created instance @yel@${name}`)

    if (join) {
        player.instance.removePlayer(player)
        instance.addPlayer(player)

        if (player.instance.name === name) {
            player.send.message(`you have been moved to the instance @yel@${name}`)
        }
    }
}
