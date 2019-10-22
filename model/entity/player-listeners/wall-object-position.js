module.exports = player => {
    player.on('wall-object-position', (position) => {
        player.send.regionWallObjects(position)
    })
}
