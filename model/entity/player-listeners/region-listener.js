module.exports = player => {
    player.on('region', (oldPosition, newPosition) => {
        let position = oldPosition
        if (!position) {
            position = newPosition ? newPosition : player.position
        }

        const objects = player.instance.getObjects(position, 20)
        const wallObjects = player.instance.getWallDecorations(position, 20)

        const objectsRequireUpdate = player.gameObjects.intersection(objects)
        const wallObjectsRequireUpdate = player.wallObjects.intersection(wallObjects)
        
        if (objectsRequireUpdate) {
            player.emit('game-object-position', position)
        }
        if (wallObjectsRequireUpdate) {
            player.emit('wall-object-position', position)
        }
    })
}
