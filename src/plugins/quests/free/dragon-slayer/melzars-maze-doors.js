// https://classic.runescape.wiki/w/Melzar%27s_Maze

const ENTRANCE_DOOR_ID = 60;
const EXIT_DOOR_ID = 54;
const LESSER_DEMON_DOOR_ID = 52;
const MAZE_KEY_ID = 421;

// { doorWallObjectID: keyItemID }
const DOOR_KEY_IDS = {
    // ground floor: red key from rats
    48: 390,

    // first floor: orange key from ghosts
    49: 391,

    // second floor: yellow key from skeletons
    50: 392,

    // dungeon: blue key from zombie
    51: 393,

    // dungeon: magenta key from melzar
    53: 394,

    // dungeon: black key from lesser demon
    52: 395
};

// capitalization discrepencies
const KEY_NAMES = {
    390: 'red key',
    391: 'Orange key',
    392: 'Yellow key',
    393: 'blue key',
    394: 'magenta key',
    395: 'Black key'
};

async function onUseWithWallObject(player, wallObject, item) {
    // the entrance door just says "Nothing interesting happens" when opening
    if (wallObject.id === ENTRANCE_DOOR_ID && item.id === MAZE_KEY_ID) {
        player.message('you unlock the door', 'You go through the door');

        await player.enterDoor(wallObject);

        return true;
    } else if (DOOR_KEY_IDS[wallObject.id] === item.id) {
        player.inventory.remove(item.id);

        player.message(
            'you unlock the door',
            'You go through the door',
            `your ${KEY_NAMES[item.id]} has gone!`
        );

        await player.enterDoor(wallObject);

        if (wallObject.id === LESSER_DEMON_DOOR_ID) {
            player.cache.melzarsChestMapPiece = true;
        }

        return true;
    }

    return false;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id === EXIT_DOOR_ID) {
        if (player.x >= wallObject.x) {
            player.message('the door is locked');
        } else {
            player.message('The door swings open', 'You go through the door');
            await player.enterDoor(wallObject);
        }

        return true;
    }

    if (DOOR_KEY_IDS.hasOwnProperty(wallObject.id)) {
        player.message('The door is locked');
        return true;
    }

    return false;
}

module.exports = { onUseWithWallObject, onWallObjectCommandOne };
