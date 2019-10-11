module.exports = player => {
    player.on('login', () => {
        player.send.worldInfo()
        // player.send.message('Welcome to Runescape!')
    })
}
