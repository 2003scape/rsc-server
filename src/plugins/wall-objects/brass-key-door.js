// https://classic.runescape.wiki/w/Brass_key

const BRASS_KEY_ID = 99;
const DOOR_ID = 23;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    player.message('The door is locked');

    return true;
}

async function onUseWithWallObject(player, wallObject, item) {
    if (wallObject.id !== DOOR_ID || item.id !== BRASS_KEY_ID) {
        return false;
    }

    player.sendBubble(item.id);

    player.message('you unlock the door', 'you go through the door');
    await player.enterDoor(wallObject);

    return true;
}

module.exports = { onWallObjectCommandOne, onUseWithWallObject };
