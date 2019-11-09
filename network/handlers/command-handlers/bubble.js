const Position = require('../../../model/world/position')

module.exports = (player, x, y, large = true) => {
    if (!x | !y) {
        return player.send.message('usage: ::bubble <x> <y> [<large?>]')
    }

    const position = new Position(+x, +y)
    const instancePlayers = player.instance.getPlayers(position)

    for (const instancePlayer of instancePlayers) {
        instancePlayer.send.teleportBubble(large, position)
    }
}
