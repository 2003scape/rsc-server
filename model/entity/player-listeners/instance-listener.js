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
            // make players aware that a new player has been added to the instance
            for (const other of newInstance.players) {
                player.players.add(other)
                player.playerUpdates.appearance(other)

                if (player !== other) {
                    other.players.add(player)
                    other.playerUpdates.appearance(player)
                }
            }
        }
    })
}
