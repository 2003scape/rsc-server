module.exports = player => {
    player.on('region', () => {
        const objects = player.instance.getObjects(player.position, 20)
        const wallObjects = player.instance.getWallDecorations(player.position, 20)

        const objectsRequireUpdate = player.gameObjects.intersection(objects)
        const wallObjectsRequireUpdate = player.wallObjects.intersection(wallObjects)
        
        console.log(`region changed`)

        if (objectsRequireUpdate) {
            player.emit('game-object-position')
        }
        if (wallObjectsRequireUpdate) {
            player.emit('wall-object-position')
        }
    })
}
