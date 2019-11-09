const Position = require('../../../model/world/position')

module.exports.name = 'bubble'

module.exports.handle = (player, x, y, large = true) => {
    if (!x | !y) {
        return player.send.message('invalid command parity')
    }

    // TODO this should probably just send the bubble to nearby players?

    const position = new Position(+x, +y)
    const instancePlayers = player.instance.getPlayers(position)

    for (const instancePlayer of instancePlayers) {
        instancePlayer.send.teleportBubble(large, position)
    }
}
