module.exports = player => {
    player.on('game-object-position', () => {
        player.send.regionObjects()
    })
}
