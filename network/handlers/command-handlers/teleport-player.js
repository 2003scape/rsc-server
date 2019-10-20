const Position = require('../../../model/world/position')

module.exports.name = 'tele'

module.exports.handle = (player, playerName, x, y) => {
    console.log(playerName, x, y)

    if (!y) {
        y = x
        x = playerName
        playerName = x
    }

    console.log(playerName, x, y)

    if (!playerName) {
        return player.send.message(`invalid parity`)
    }

    const targetPlayer = playerName == x ? player : player.session.server.findPlayer(playerName)

    if (!targetPlayer) {
        return player.send.message(`player @yel@${playerName} @whi@was not found`)
    }

    try {
        targetPlayer.position = new Position(+x, +y)

        if (player !== targetPlayer) {
            targetPlayer.send.message(`you have been teleported by ${player.username}`)
        }
    } catch (_) {
        player.send.message('error parsing coordinates')
    }
}
