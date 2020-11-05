async function playerTrade({ player }, { index }) {
    const { world } = player;

    if (player.index === index) {
        throw new RangeError(`${player} trading with self`);
    }

    const otherPlayer = world.players.getByIndex(index);

    if (!otherPlayer) {
        throw new RangeError(
            `${player} tried to trade with invalid player index ${index}`
        );
    }

    if (!player.withinRange(otherPlayer, 8, true)) {
        player.message("I'm not near enough");
        return;
    }

    if (!player.withinLineOfSight(otherPlayer)) {
        player.message('There is an obstacle in the way');
        return;
    }

    console.log(`${player} wants to trade with ${otherPlayer}`);
}

module.exports = { playerTrade };
