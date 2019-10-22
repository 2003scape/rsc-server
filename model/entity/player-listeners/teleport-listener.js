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
            player.gameObjects.remove(object)
        }
        for (const object of player.wallObjects.knownObjects) {
            player.wallObjects.remove(object)
        }

        setTimeout(() => {
            const playersInArea = player.instance.getPlayers(position, player.viewDistance)

            for (const p of playersInArea) {
                if (player !== p && !player.players.knows(p)) {
                    player.players.add(p)
                    player.playerUpdates.appearance(p)

                    p.players.add(player)
                    p.playerUpdates.appearance(player)
                }
            }

            const objectsInArea = player.instance.getObjects(position, 20)
            const wallObjectsinArea = player.instance.getWallDecorations(position, 20)

            player.gameObjects.intersection(objectsInArea)
            player.gameObjects.intersection(wallObjectsinArea)

            player.emit('game-object-position', position)
            player.emit('wall-object-position', position)
        }, 600)
    })
}
