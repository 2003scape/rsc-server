module.exports = player => {
    player.on('game-object-position', (position) => {
        player.send.regionObjects(position)
    })
}
