function getGameObject(player, x, y) {
    const { world } = player;

    const [gameObject] = world.gameObjects.getAtPoint(x, y);

    if (!gameObject) {
        throw new RangeError(`invalid gameObject index ${index}`);
    }

    if (!gameObject.withinRange(player, 2)) {
        return;
    }

    return gameObject;
}

function gameObjectCommand(pluginHandler, { player }, { x, y }) {
    player.endWalkFunction = async () => {
        const gameObject = getGameObject(player, x, y);

        if (!gameObject) {
            return;
        }

        const { world } = player;

        await world.sleepTicks(1);

        player.lock();
        player.faceEntity(gameObject);
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
    player.endWalkFunction = async () => {
        const item = player.inventory.items[index];

        if (!item) {
            throw new RangeError(`invalid inventory index ${index}`);
        }

        const gameObject = getGameObject(player, x, y);

        if (!gameObject) {
            return;
        }

        const { world } = player;

        await world.sleepTicks(1);

        player.lock();
        player.faceEntity(gameObject);

        const blocked = await world.callPlugin(
            'onUseWithGameObject',
            player,
            gameObject,
            item
        );

        player.unlock();

        if (!blocked) {
            player.message('Nothing interesting happens');
        }
    };
}

module.exports = { objectCommandOne, objectCommandTwo, useWithObject };
