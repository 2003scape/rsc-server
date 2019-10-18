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
            packet.addBits(1, 1)
            packet.addBits(1, 1)
            packet.addBits(12, 4)
        } else if (event) {
            packet.addBits(1, 1)
            packet.addBits(event.type, 1)
            packet.addBits(event.value, event.bits)
        } else {
            // no events occurred for this player
            packet.addBits(0, 1)
        }

        players.acknowledge(known)
    }

    // modifying a collection while iterating over it... uh... this could cause problems.
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
