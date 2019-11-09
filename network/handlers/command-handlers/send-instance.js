module.exports.name = 'sendinst'

module.exports.handle = (player, playerName, instanceName) => {
    const targetPlayer = player.session.server.findPlayer(playerName)

    const targetInstance = player.session.server.findInstance(
        instanceName || 'GLOBAL_INSTANCE')

    if (!targetPlayer) {
        return player.send.message(`player @yel@${playerName} @whi@ not found`)
    }

    if (!targetInstance) {
        return player.send.message(`instance @yel@${instanceName} @whi@ does ` +
            'not exist')
    }

    targetPlayer.instance.removePlayer(targetPlayer)
    targetInstance.addPlayer(targetPlayer)

    player.send.message(`@yel@${playerName} @whi@was moved to the ` +
        `@yel@${instanceName} @whi@instance`)
    targetPlayer.send.message(`you have been warped inside ` +
        `@yel@${instanceName}`)
}
