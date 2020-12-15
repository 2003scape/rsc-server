function getGameObject(player, x, y) {
    const { world } = player;
    const [gameObject] = world.gameObjects.getAtPoint(x, y);

    if (!gameObject) {
        throw new RangeError(`invalid gameObject at point ${x}, ${y}`);
    }

    if (!gameObject.withinRange(player, 2, true)) {
        return;
    }

    return gameObject;
}

function gameObjectCommand(pluginHandler, { player }, { x, y }) {
    if (player.locked) {
        return;
    }

    player.endWalkFunction = async () => {
        if (player.locked) {
            return;
        }

        const gameObject = getGameObject(player, x, y);

        if (!gameObject || player.locked) {
            return;
        }

        const { world } = player;

        player.lock();

        await world.sleepTicks(1);

        if (player.opponent) {
            return;
        }

        await world.callPlugin(pluginHandler, player, gameObject);

        player.unlock();
    };
}

async function objectCommandOne(socket, message) {
    gameObjectCommand('onGameObjectCommandOne', socket, message);
}

async function objectCommandTwo(socket, message) {
    gameObjectCommand('onGameObjectCommandTwo', socket, message);
}

async function useWithObject({ player }, { x, y, index }) {
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

        const gameObject = getGameObject(player, x, y);

        if (!gameObject) {
            return;
        }

        const { world } = player;

        if (!world.members && item.definition.members) {
            player.message('Nothing interesting happens');
            return;
        }

        player.lock();
        await world.sleepTicks(1);

        const blocked = await world.callPlugin(
            'onUseWithGameObject',
            player,
            gameObject,
            item
        );

        if (!blocked) {
            player.message('Nothing interesting happens');
        }

        player.unlock();
    };
}

module.exports = { objectCommandOne, objectCommandTwo, useWithObject };
