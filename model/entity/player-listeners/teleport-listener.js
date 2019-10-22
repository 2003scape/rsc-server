module.exports = player => {
    player.on('teleport', (position, visible) => {
        if (!position) {
            return
        }

        console.log(`${player.username} is teleporting to ${position}:${visible}`)

        for (const p of player.players.known) {
            p.players.remove(player)
            player.players.remove(p)
        }

        player.gameObjects.newObjects.clear()
        player.wallObjects.newObjects.clear()
        
        for (const object of player.gameObjects.knownObjects) {
            player.gameObjects.delete(object)
        }
        for (const object of player.wallObjects.knownObjects) {
            player.wallObjects.delete(object)
        }

        setTimeout(() => {
            const playersInArea = player.instance.getPlayers(player.position, player.viewDistance)

            for (const p of playersInArea) {
                if (player !== p && !player.players.knows(p)) {
                    player.players.add(p)
                    player.playerUpdates.appearance(p)

                    p.players.add(player)
                    p.playerUpdates.appearance(player)
                }
            }

            const objectsInArea = player.instance.getObjects(player.position, 20)
            const wallObjectsinArea = player.instance.getWallDecorations(player.position, 20)

            player.gameObjects.intersection(objectsInArea)
            player.gameObjects.intersection(wallObjectsinArea)

            player.emit('game-object-position', player.position)
            player.emit('wall-object-position', player.position)
        }, 600)
    })
}
