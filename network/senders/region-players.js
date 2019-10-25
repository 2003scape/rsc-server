const Encoder = require('../packet/encoder')

module.exports.name = 'region-players'

module.exports.send = (session, id) => {
    const packet = new Encoder(id)
    const player = session.player
    const players = player.players

    // the player's position
    packet.addBits(player.position.x, 11)
        .addBits(player.position.y, 13)

    // the player's animation (or direction)
    packet.addBits(player.direction, 4)

    // known player count to be updated
    packet.addBits(players.known.size, 8)

    for (const known of players.known) {
        const event = players.events[known.index]

        if (known.index === -1) {
            // player update is available
            packet.addBits(0b1, 1)

            packet.addBits(0b1, 1) // update type, change animation

            // animation bits -- remove player must have the 3rd and 4th MSB
            // set in order to remove the player, otherwise the client
            // interprets this as an animation change. 
            packet.addBits(0b1100, 4)
        } else if (event) {
            // player update is available
            packet.addBits(0b1, 1)
            
            // update type, (change animation/movement)
            packet.addBits(event.type, 1)

            // animation bits -- vary depending on update type (either 3 or 4)
            packet.addBits(event.value, event.bits)
        } else {
            // no events occurred for this player
            packet.addBits(0b0, 1)
        }

        players.acknowledge(known)
    }

    // modifying a collection while iterating over it... uh... this could cause problems.
    // unless node makes a copy of the array, then this is fine.
    for (const unknown of players.unknown) {
        packet.addBits(unknown.index, 11)

        const offset = player.position.offsetFrom(unknown.position)
        packet.addBits(offset.x, 5)
            .addBits(offset.y, 5)

        packet.addBits(unknown.direction, 4)

        // i think this type of update is actually to update if a player moved or added,
        // and this bit determines whether the player is a new and being added or an existing player being updated
        // 0 == new, 1 == updated?
        packet.addBits(0, 1)

        players.acknowledge(unknown)
    }

    session.write(packet.build())
}
