const Encoder = require('../packet/encoder')
const PlayerUpdate = require('../../model/entity/player-update')

module.exports.name = 'region-player-update'

module.exports.send = (session, id) => {
    const updates = session.player.playerUpdates

    if (updates.updates.length === 0) {
        // no updates, no packet to send
        return
    }

    const packet = new Encoder(id)

    packet.addShort(updates.updates.length)

    for (const update of updates.updates) {
        packet.addShort(update.index)
            .addByte(update.type)

        switch (update.type) {
            case PlayerUpdate.Type.APPEARANCE:
                packet.addShort(update.spriteChanges)
                packet.addLong(update.username)

                packet.addByte(update.sprites.length)
                    .addBytes(update.sprites)

                packet.addByte(update.appearance.hairColor)
                    .addByte(update.appearance.topColor)
                    .addByte(update.appearance.legColor)
                    .addByte(update.appearance.skinColor)

                packet.addByte(update.level)
                packet.addBoolean(update.skulled)
                break

            case PlayerUpdate.Type.CHAT_MESSAGE:
            case PlayerUpdate.Type.PRIVILEGED_CHAT_MESSAGE:
                break

            case PlayerUpdate.Type.NPC_PROJECTILE:
            case PlayerUpdate.Type.PLAYER_PROJECTILE:
                break

            case PlayerUpdate.Type.DAMAGE:
                break

            case PlayerUpdate.Type.OVERHEAD_ACTION:
                break
        }
    }

    updates.clear()
    session.write(packet.build())
}
