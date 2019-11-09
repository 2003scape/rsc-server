module.exports = player => {
    player.on('login', () => {
        console.log(`${player.username} has logged in`)

        player.session.send.worldInfo()
        player.session.send.message('Welcome to RuneScape')

        // we have to add a delay here, the position updaters require the client
        // to already know its own position before receiving any entity position
        // packets. therefore, just add 1 game tick delay
        setTimeout(() => {
            player.emit('appearance')
            player.emit('position')
        }, 600)
    })
}
