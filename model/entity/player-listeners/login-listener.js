module.exports = player => {
    player.on('login', () => {
        player.session.send.worldInfo()
        player.session.send.message('Welcome to Runescape!')
    })
}
