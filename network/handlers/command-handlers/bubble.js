const Position = require('../../../model/world/position')

module.exports.name = 'bubble'

module.exports.handle = (player, x, y, large = true) => {
    if (!x | !y) {
        return player.send.message('invalid command parity')
    }

    const position = new Position(+x, +y)
    const players = player.instance.getPlayers(position)

    for (const player of players) {
        player.send.teleportBubble(large, position)
    }
}
