module.exports = player => {
    player.on('death', () => player.session.send.playerDied())
}
