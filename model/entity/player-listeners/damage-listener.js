module.exports = player => {
    player.on('damage', amount => {
        // TODO: actually damage the player...
        for (const p of player.players.known) {
            p.playerUpdates.damage(player, amount, 0, 10)
        }
    })
}
