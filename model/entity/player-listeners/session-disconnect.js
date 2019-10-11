module.exports = player => {
    // releases the player's index to be reused by someone else
    player.session.on('disconnect', () => {
        if (player.index < 0) {
            return
        }
        player.session.server.playerIndex.release(this.index)
        player.index = -1
    })
}
