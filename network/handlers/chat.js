module.exports = async (session, buffer) => {
    const player = session.player
    const message = buffer.readBuffer()
    const players = player.players.known

    for (const p of players) {
        if (p !== player) {
            p.playerUpdates.chat(player, message)
        }
    }
}
