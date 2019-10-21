module.exports = gameObject => {
    gameObject.on('instance', (oldInstance, newInstance) => {
        if (oldInstance) {
            oldInstance.removeObject(gameObject)

            const players = oldInstance.getPlayers(gameObject.position, 30)

            for (const player of players) {
                player.objects.remove(gameObject)
            }
        }
        if (newInstance) {
            const players = newInstance.getPlayers(gameObject.position, 30)

            for (const player of players) {
                player.objects.add(gameObject)
            }
        }
    })
}
