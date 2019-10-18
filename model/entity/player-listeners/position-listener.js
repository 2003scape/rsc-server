function walk(player, oldPosition, newPosition) {
    const playersInArea = player.instance.getPlayers(player.position, player.viewDistance)
    const players = player.players

    // the player has found new players to be added to their unknown list.
    for (const p of playersInArea) {
        if (!players.knows(p)) {
            player.players.add(p)
            p.players.add(player)
        }
    }

    // the player has moved far enough away from the known player
    // they are no longer in the view distance. make both players aware
    for (const known of players.known) {
        const distance = newPosition.distance(known.position)

        if (distance > player.viewDistance) {
            players.remove(known)
            known.players.remove(player)
            return
        }
    }
    if (oldPosition) {
        // this triggers an event to all watched players, alerting them
        // of this player's movement
        player.direction = newPosition.direction(oldPosition)
    }
}

module.exports = player => {
    player.on('position', (oldPosition, newPosition) => {
        // if the player moved more than 1 tile away it has to be considered a teleport.
        // the player must be removed from all watched entities, and readded. technically,
        // this IS a teleport as players are not able to move more than 1 tile at a time.
        const dist = oldPosition ? newPosition.distance(oldPosition) : 1

        console.log(`${player.username} has moved a dist of ${dist}!!`)

        if (dist <= 1) {
            walk(player, oldPosition, newPosition)
        } else {
            player.emit('teleport', newPosition, false)
        }
    })

    player.on('position', () => player.instance.playerMoved(player))
}
