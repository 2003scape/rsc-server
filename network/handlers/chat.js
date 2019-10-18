module.exports.name = 'chat'

module.exports.handle = (session, buffer) => new Promise(resolve => {
    const player = session.player
    const message = buffer.readBuffer()
    const players = player.instance.getPlayers(player.position, player.viewDistance)

    for (const p of players) {
        if (p !== player) {
            p.playerUpdates.chat(player, message)
        }
    }
    resolve()
})
