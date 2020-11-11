const DOORFRAME_ID = 1;
const DOOR_ID = 2;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const { world } = player;

    world.replaceEntity('wallObjects', wallObject, DOORFRAME_ID);
    player.message('The door swings open');
    player.sendSound('opendoor');

    return true;
}

async function onWallObjectCommandTwo(player, wallObject) {
    if (wallObject.id !== DOORFRAME_ID) {
        return false;
    }

    const { world } = player;

    player.lock();
    world.replaceEntity('wallObjects', wallObject, DOOR_ID);
    player.message('The door creaks shut');
    player.sendSound('closedoor');
    await world.sleepTicks(1);
    player.unlock();

    return true;
}

module.exports = { onWallObjectCommandOne, onWallObjectCommandTwo };
