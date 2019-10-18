module.exports = player => {
    player.on('teleport', (position, visible) => {
        console.log(`${player.username} is teleporting to ${position}:${visible}`)

        for (const p of player.players.known) {
            p.players.remove(player)
            player.players.remove(p)
        }

        const playersInArea = player.instance.getPlayers(player.position, player.viewDistance)

        console.log('players in teleport:', playersInArea.map(pl => pl.username))

        for (const p of playersInArea) {
            player.players.add(p)
            p.players.add(player)
        }
    })
}
