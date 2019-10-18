module.exports = player => {
    player.on('direction', () => {
        for (const p of player.players.known) {
            p.players.reorient(player)
        }
    })
}
