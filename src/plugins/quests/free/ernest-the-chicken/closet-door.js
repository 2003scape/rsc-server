const CLOSET_DOOR_ID = 35;
const CLOSET_KEY_ID = 212;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== CLOSET_DOOR_ID) {
        return false;
    }

    // looks like jagex would've locked you in here, we'll only do it if they
    // have the key and aren't using it.
    // https://youtu.be/O0niE7nbXYA?t=422
    if (!player.inventory.has(CLOSET_KEY_ID) && player.x < wallObject.x) {
        await player.enterDoor(wallObject);
        player.message('You go through the door');
    } else {
        player.message('The door is locked');
    }

    return true;
}

async function onUseWithWallObject(player, wallObject, item) {
    if (wallObject.id !== CLOSET_DOOR_ID || item.id !== CLOSET_KEY_ID) {
        return false;
    }

    player.sendBubble(item.id);
    player.message('You unlock the door', 'You go through the door');
    await player.enterDoor(wallObject);

    return true;
}

module.exports = { onWallObjectCommandOne, onUseWithWallObject };
