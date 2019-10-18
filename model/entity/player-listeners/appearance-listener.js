module.exports = player => {
    player.on('appearance', () => {
        for (const p of player.players.known) {
            p.playerUpdates.appearance(player)
        }
    })
}
