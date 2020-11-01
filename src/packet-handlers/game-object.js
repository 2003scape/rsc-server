function gameObjectCommand(pluginHandler, { player }, { x, y }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const [gameObject] = world.gameObjects.getAtPoint(x, y);

        if (!gameObject) {
            throw new RangeError(`invalid gameObject index ${index}`);
        }

        if (!gameObject.withinRange(player, 2)) {
            return;
        }

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

module.exports = { objectCommandOne, objectCommandTwo };
