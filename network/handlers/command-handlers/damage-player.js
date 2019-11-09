module.exports.name = 'damage'

module.exports.handle = (player, playerName, damage) => {
    if (!playerName || !damage) {
        return player.send.message('invalid parity')
    }

    const targetPlayer = player.session.server.findPlayer(playerName)

    if (!targetPlayer) {
        return player.send.message(`player @yel@${playerName} @whi@ not found`)
    }

    try {
        const amount = +damage
        targetPlayer.emit('damage', amount)
        player.send.message(`sent @yel@${damage} @whi@damage to ` +
            `@yel@${playerName}`)
    } catch (_) {
        player.send.message(`invalid damage`)
    }
}
