module.exports = player => {
    player.on('instance', (oldInstance, newInstance) => {
        if (oldInstance) {
            oldInstance.removePlayer(player)

            // the old instance is no longer needed since it's empty,
            // we can tell the server to dispose of it
            if (oldInstance.disposeWhenEmpty && oldInstance.players.size === 0) {
                console.log(`deleted instance ${oldInstance.name}`)
                player.session.server.instances.delete(oldInstance)
            }
        }
        if (newInstance) {
            // forget oldInstance's entities
            for (const p of player.players.known) {
                p.players.remove(player)
            }
            player.players.forget()

            // inform player of newInstance's entities
            const players = newInstance.getPlayers(player.position, player.viewDistance)

            for (const p of players) {
                if (player !== p) {
                    player.players.add(p)
                    player.playerUpdates.appearance(p)

                    p.players.add(player)
                    p.playerUpdates.appearance(player)
                }
            }
        }
    })
}
