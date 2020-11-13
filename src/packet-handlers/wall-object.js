function wallObjectCommand(pluginHandler, { player }, { x, y }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const [wallObject] = world.wallObjects.getAtPoint(x, y);

        if (!wallObject) {
            throw new RangeError(`invalid wallObject index ${index}`);
        }

        if (!wallObject.withinRange(player, 3, true)) {
            return;
        }

        await player.walkToPoint(wallObject.x, wallObject.y);

        player.faceEntity(wallObject);

        await world.callPlugin(pluginHandler, player, wallObject);
    };
}

async function wallObjectCommandOne(socket, message) {
    wallObjectCommand('onWallObjectCommandOne', socket, message);
}

async function wallObjectCommandTwo(socket, message) {
    wallObjectCommand('onWallObjectCommandTwo', socket, message);
}

module.exports = { wallObjectCommandOne, wallObjectCommandTwo };
