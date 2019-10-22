module.exports = player => {
    player.on('region', (oldPosition, newPosition) => {
        let position = oldPosition
        if (!position) {
            position = newPosition ? newPosition : player.position
        }

        const objects = player.instance.getObjects(position)
        const wallObjects = player.instance.getWallObject(position)

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
