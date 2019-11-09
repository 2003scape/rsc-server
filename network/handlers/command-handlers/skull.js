module.exports = (player, playerName, skullDuration) => {
    if (!playerName || !skullDuration) {
        return player.send.message('usage: ::skull <player> <duration>')
    }

    const targetPlayer = player.session.server.findPlayer(playerName)

    if (!targetPlayer) {
        return player.send.message(`player @yel@${playerName} @whi@ not found`)
    }

    try {
        const duration = +skullDuration
        targetPlayer.skulled = duration
    } catch (_) {
        player.send.message(`invalid skull duration`)
    }
}
