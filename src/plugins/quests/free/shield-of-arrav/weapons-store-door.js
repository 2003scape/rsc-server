// https://classic.runescape.wiki/w/Key_(Weapons_Store)

const DOOR_ID = 20;
const WEAPONS_STORE_KEY_ID = 48;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    player.message('The door is locked');

    if (player.inventory.has(WEAPONS_STORE_KEY_ID)) {
        player.message('You need to use your key to open it');
    }

    return true;
}

async function onUseWithWallObject(player, wallObject, item) {
    if (wallObject.id !== DOOR_ID || item.id !== WEAPONS_STORE_KEY_ID) {
        return false;
    }

    player.sendBubble(item.id);
    player.message("You unlock the door", "You go through the door");
    await player.enterDoor(wallObject);

    return true;
}

module.exports = { onWallObjectCommandOne, onUseWithWallObject };
