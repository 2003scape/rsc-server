module.exports = player => {
    player.on('teleport', (position, visible) => {
        console.log(`${player.username} is teleporting to ${position}:${visible}`)

        for (const p of player.players.known) {
            p.players.remove(player)
            player.players.remove(p)
        }

        setTimeout(() => {
            const playersInArea = player.instance.getPlayers(player.position, player.viewDistance)

            for (const p of playersInArea) {
                if (player !== p && !player.players.knows(p)) {
                    player.players.add(p)
                    player.playerUpdates.appearance(p)

                    p.players.add(player)
                    p.playerUpdates.appearance(player)
                }
            }
        }, 600)
    })
}
