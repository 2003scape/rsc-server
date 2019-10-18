module.exports = player => {
    player.on('direction', () => {
        for (const p of player.players.known) {
            if (p !== player) {
                // we don't have to update the reoriented player
                // since they get a packet every 600ms telling them
                // their orientation
                p.players.reorient(player)
            }
        }
    })
}
