module.exports = player => {
    player.on('login', () => {
        console.log(`${player.username} has logged in`)
        player.session.send.worldInfo()
        player.session.send.message('Welcome to Runescape!')

        player.emit('appearance')
    })
}
