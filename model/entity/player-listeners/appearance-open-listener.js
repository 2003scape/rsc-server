module.exports = player => {
    player.on('appearance-open', () => {
        player.session.send.appearance()
    })
}
