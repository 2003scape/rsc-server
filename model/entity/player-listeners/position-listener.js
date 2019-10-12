module.exports = player => {
    player.on('position', (oldPosition, newPosition) => {
        for (const known of player.players.known) {
            const distance = newPosition.distance(known.position)

            // the player has moved far enough away from the known player
            // they are no longer in the view distance. make both players aware
            if (distance > player.viewDistance) {
                player.players.remove(known)
                known.players.remove(player)
                return
            }

            // the players are still in within distance of each other
            // we must notify the known player of this player's movement
            // TODO: gonna have to wait tho....
        }
    })
}
