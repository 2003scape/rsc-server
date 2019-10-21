module.exports = player => {
    player.on('wall-object-position', () => {
        player.send.regionWallObjects()
    })
}
