module.exports = player => {
    player.on('damage', amount => {
        const players = player.instance.getPlayers(player.position,
            player.viewDistance)

        for (const p of players) {
            p.playerUpdates.damage(player, amount)
        }
    })
}
