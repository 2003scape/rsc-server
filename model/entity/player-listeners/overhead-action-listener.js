module.exports = player => {
    player.on('overhead-action', item => {
        for (const p of player.players.known) {
            p.playerUpdates.action(player, item)
        }
    })
}
