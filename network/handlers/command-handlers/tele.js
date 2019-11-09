const Position = require('../../../model/world/position')

module.exports = (player, playerName, x, y) => {
    if (!y) {
        y = x
        x = playerName
        playerName = x
    }

    if (!playerName) {
        return player.send.message('usage: ::tele <player> <x> <y>')
    }

    const targetPlayer = playerName == x ? player
        : player.session.server.findPlayer(playerName)

    if (!targetPlayer) {
        return player.send.message(`player @yel@${playerName} @whi@ not found`)
    }

    try {
        targetPlayer.position = new Position(+x, +y)

        if (player !== targetPlayer) {
            targetPlayer.send.message(`you have been teleported by ` +
                `${player.username}`)
        }
    } catch (e) {
        player.send.message('error parsing coordinates')
    }
}
