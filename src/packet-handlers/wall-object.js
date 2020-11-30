function getWallObject(player, x, y) {
    const { world } = player;
    const [wallObject] = world.wallObjects.getAtPoint(x, y);

    if (!wallObject) {
        throw new RangeError(`invalid wallObject at ${x}, ${y}`);
    }

    if (!wallObject.withinRange(player, 2)) {
        return;
    }

    return wallObject;
}

function wallObjectCommand(pluginHandler, { player }, { x, y }) {
    if (player.locked) {
        return;
    }

    player.endWalkFunction = async () => {
        if (player.locked) {
            return;
        }

        const { world } = player;
        const wallObject = getWallObject(player, x, y);

        if (!wallObject) {
            return;
        }

        player.lock();

        await world.sleepTicks(1);

        const blocked = await world.callPlugin(
            pluginHandler,
            player,
            wallObject
        );

        if (!blocked) {
            player.message('Nothing interesting happens');
        }

        player.unlock();
    };
}

async function wallObjectCommandOne(socket, message) {
    wallObjectCommand('onWallObjectCommandOne', socket, message);
}

async function wallObjectCommandTwo(socket, message) {
    wallObjectCommand('onWallObjectCommandTwo', socket, message);
}

async function useWithWallObject({ player }, { x, y, index }) {
    if (player.locked) {
        return;
    }

    player.endWalkFunction = async () => {
        if (player.locked) {
            return;
        }

        const item = player.inventory.items[index];

        if (!item) {
            throw new RangeError(`invalid inventory index ${index}`);
        }

        const wallObject = getWallObject(player, x, y);

        if (!wallObject) {
            return;
        }

        const { world } = player;

        player.lock();

        await world.sleepTicks(1);

        const blocked = await world.callPlugin(
            'onUseWithWallObject',
            player,
            wallObject,
            item
        );

        if (!blocked) {
            player.message('Nothing interesting happens');
        }

        player.unlock();
    };
}

module.exports = {
    wallObjectCommandOne,
    wallObjectCommandTwo,
    useWithWallObject
};
