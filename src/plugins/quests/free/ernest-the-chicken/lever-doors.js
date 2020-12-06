// used to reset the puzzle
const LADDER_ID = 130;

const LEVER_IDS = {
    124: 'A',
    125: 'B',
    126: 'C',
    127: 'D',
    128: 'E',
    129: 'F'
};

// the combinations of which lever letters need to be pulled up or down to
// open each door
// { lockedDoorID: { down: ['A'...'F'], up: [] }
const DOOR_COMBINATIONS = {
    25: { down: ['D', 'F'], up: ['A', 'B'] },
    26: { down: ['D', 'F'], up: ['A', 'B'] },
    27: { down: ['A', 'B', 'D'], up: ['C', 'E', 'F'] },
    28: { down: ['D'], up: ['A', 'B', 'C', 'E', 'F'] },
    29: { down: ['C', 'D', 'F'], up: ['A', 'B', 'E'] },
    30: { down: ['D', 'F'], up: ['A', 'B', 'E'] },
    31: { down: ['D'], up: ['A', 'B', 'C', 'E', 'F'] },
    32: { down: ['A', 'B'], up: ['C', 'D', 'E', 'F'] },
    33: { down: ['D'], up: [] }
};

function storeLever(player, letter) {
    if (!player.cache.oilCanLevers) {
        player.cache.oilCanLevers = {};

        for (const letter of Object.values(LEVER_IDS)) {
            player.cache.oilCanLevers[letter] = false;
        }
    }

    const pulledDown = player.cache.oilCanLevers[letter];

    return (player.cache.oilCanLevers[letter] = !pulledDown);
}

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id === LADDER_ID) {
        delete player.cache.oilCanLevers;
        player.climb(gameObject, true);
        return true;
    }

    if (!LEVER_IDS.hasOwnProperty(gameObject.id)) {
        return false;
    }

    const letter = LEVER_IDS[gameObject.id];
    const position = storeLever(player, letter) ? 'down' : 'up';

    player.message(`You pull lever ${letter} ${position}`, 'you hear a clunk');

    return true;
}

async function onGameObjectCommandTwo(player, gameObject) {
    const letter = LEVER_IDS[gameObject.id];

    if (!letter) {
        return false;
    }

    let position = 'up';

    if (player.cache.oilCanLevers) {
        position = player.cache.oilCanLevers[letter] ? 'down' : 'up';
    }

    player.message(`The lever is ${position}`);

    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    const combination = DOOR_COMBINATIONS[wallObject.id];

    if (!combination) {
        return false;
    }

    const leverPositions = player.cache.oilCanLevers || {};

    let locked = false;

    for (const letter of combination.up) {
        if (leverPositions[letter]) {
            locked = true;
            break;
        }
    }

    if (!locked) {
        for (const letter of combination.down) {
            if (!leverPositions[letter]) {
                locked = true;
                break;
            }
        }
    }

    if (locked) {
        player.message('The door is locked');
    } else {
        await player.enterDoor(wallObject);
    }

    return true;
}

module.exports = {
    onGameObjectCommandOne,
    onGameObjectCommandTwo,
    onWallObjectCommandOne
};
