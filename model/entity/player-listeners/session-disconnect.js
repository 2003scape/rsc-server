module.exports = player => {
    player.session.on('disconnect', () => {
        console.log(`${player.username} has logged off`)

        const instance = player.instance

        if (instance) {
            instance.removePlayer(player)

            if (instance.disposeWhenEmpty && instance.players.size === 0) {
                console.log(`deleted instance ${instance.name}`)
                player.session.server.instances.delete(instance)
            }
        }

        if (player.index < 0) {
            return
        }
        player.session.server.playerIndex.release(this.index)
        player.index = -1
    })
}
