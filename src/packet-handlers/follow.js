async function playerFollow({ player }, { index }) {
    const { world } = player;
    const otherPlayer = world.players.getByIndex(index);

    if (!otherPlayer) {
        throw new RangeError(`invalid player index ${index}`);
    }

    if (!player.localEntities.known.players.has(otherPlayer)) {
        throw new RangeError(`player trying to follow unknown target player`);
    }

    player.following = otherPlayer;
    player.message(`Following ${otherPlayer.getFormattedUsername()}`);
}

module.exports = { playerFollow };
