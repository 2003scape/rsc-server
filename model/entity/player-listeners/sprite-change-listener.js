module.exports = player => {
    player.on('sprites', (oldSprites, newSprites) => {
        player.playerUpdates.appearance(player)

        for (const p of player.players.known) {
            p.playerUpdates.appearance(player)
        }
    })
}
