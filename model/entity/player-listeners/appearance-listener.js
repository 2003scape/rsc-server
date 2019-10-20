module.exports = player => {
    player.on('appearance', () => {
        player.playerUpdates.appearance(player)

        for (const p of player.players.known) {
            p.playerUpdates.appearance(player)
        }
    })
}
