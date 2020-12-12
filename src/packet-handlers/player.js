async function getPlayer(player, index) {
    if (player.locked) {
        return;
    }

    const { world } = player;
    const otherPlayer = world.players.getByIndex(index);

    if (!otherPlayer) {
        throw new RangeError(`invalid player index ${index}`);
    }

    if (!otherPlayer.withinRange(player, 3, true)) {
        if (otherPlayer.withinRange(player, 8)) {
            await player.chase(otherPlayer);
        } else {
            return;
        }

        if (!otherPlayer.withinRange(player, 3, true)) {
            return;
        }
    }

    otherPlayer.stepsLeft = 0;
    player.lock();

    return otherPlayer;
}

async function useWithPlayer({ player }, { playerIndex, index }) {
    if (player.locked) {
        return;
    }

    // so players face the other player when using items, instead of walking
    // through them
    player.walkAction = false;

    player.endWalkFunction = async () => {
        const item = player.inventory.items[index];

        if (!item) {
            throw new RangeError(`invalid item index ${index}`);
        }

        const { world } = player;
        const otherPlayer = await getPlayer(player, playerIndex);

        if (!otherPlayer) {
            player.unlock();
            return;
        }

        if (!world.members && item.definition.members) {
            player.message('Nothing interesting happens');
            return;
        }

        const blocked = await world.callPlugin('onUseWithPlayer',
            player,
            otherPlayer,
            item
        );

        player.unlock();

        if (!blocked) {
            player.message('Nothing interesting happens');
        }
    };
}

module.exports = { useWithPlayer };
