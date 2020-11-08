const WallObject = require('../../model/wall-object');

const DOORFRAME_ID = 1;
const DOOR_ID = 2;

function replaceWallObject(wallObject, newID) {
    const { world, x, y, direction } = wallObject;
    const newDoor = new WallObject(world, { id: newID, direction, x, y });
    world.removeEntity('wallObjects', wallObject);
    world.addEntity('wallObjects', newDoor);
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    replaceWallObject(wallObject, DOORFRAME_ID);
    player.message('The door creaks open');
    player.sendSound('opendoor');

    return true;
}

async function onWallObjectCommandTwo(player, wallObject) {
    if (wallObject.id !== DOORFRAME_ID) {
        return false;
    }

    const { world } = player;

    player.lock();
    replaceWallObject(wallObject, DOOR_ID);
    player.message('The door creaks shut');
    player.sendSound('closedoor');
    await world.sleepTicks(1);
    player.unlock();

    return true;
}

module.exports = { onWallObjectCommandOne, onWallObjectCommandTwo };
