const BACK_DOOR_ID = 37;
const DOORFRAME_ID = 11;
const FRONT_DOOR_ID = 36;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== FRONT_DOOR_ID && wallObject.id !== BACK_DOOR_ID) {
        return false;
    }

    if (wallObject.id === BACK_DOOR_ID) {
        player.message('You go through the door');
        await player.enterDoor(wallObject);
    } else {
        if (player.y === wallObject.y) {
            const { world } = player;

            player.message('You go through the door');

            world.nextTick(() => player.unlock());
            await player.enterDoor(wallObject, DOORFRAME_ID, 5);

            player.message('The door slams behind you!');
            player.sendSound('closedoor');
        } else {
            player.message("The door won't open");
        }
    }

    return true;
}

module.exports = { onWallObjectCommandOne };
