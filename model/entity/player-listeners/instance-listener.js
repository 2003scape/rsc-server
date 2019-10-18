module.exports = player => {
    player.on('instance', (oldInstance, newInstance) => {
        if (oldInstance) {
            oldInstance.removePlayer(player)

            // the old instance is no longer needed since it's empty,
            // we can tell the server to dispose of it
            if (oldInstance.disposeWhenEmpty && oldInstance.player.size === 0) {
                player.session.server.delete(oldInstance)
            }
        }
        if (newInstance) {
            const players = newInstance.getPlayers(player.position, player.viewDistance)

            for (const p of players) {
                player.players.add(p)
                player.playerUpdates.appearance(p)

                if (player !== p) {
                    p.players.add(player)
                    p.playerUpdates.appearance(player)
                }
            }
        }
    })
}
