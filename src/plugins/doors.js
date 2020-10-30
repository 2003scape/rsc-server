const WallObject = require('../model/wall-object');

const DOORFRAME_ID = 1;
const DOOR_ID = 2;

async function onWallObjectCommandOne(player, wallObject) {
    const { world } = player;

    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const doorframe = new WallObject(world, {
        id: DOORFRAME_ID,
        direction: wallObject.direction,
        x: wallObject.x,
        y: wallObject.y
    });

    player.sendSound('opendoor');
    world.addEntity('wallObjects', doorframe);
    return true;
}

async function onWallObjectCommandTwo(player, wallObject) {
    const { world } = player;

    if (wallObject.id !== DOORFRAME_ID) {
        return false;
    }

    const door = new WallObject(world, {
        id: DOOR_ID,
        direction: wallObject.direction,
        x: wallObject.x,
        y: wallObject.y
    });

    player.sendSound('closedoor');
    world.addEntity('wallObjects', door);
    return true;
}

module.exports = { onWallObjectCommandOne, onWallObjectCommandTwo };
