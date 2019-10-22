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
            player.emit('teleport', player.position)
        }
    })
}
