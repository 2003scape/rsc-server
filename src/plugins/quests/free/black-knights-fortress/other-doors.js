const BLACK_KNIGHT_ID = 66;

const ODD_WALL_ID = 22;
const SIDE_DOOR_ID = 40;

async function randomBlackKnightAttack(player) {
    // Even the ones outside yell at you sometimes
    const blackKnights =
        player.getNearbyEntitiesByID('npcs', BLACK_KNIGHT_ID, 12);

    if (!blackKnights) {
        return;
    }

    const blackKnight =
        blackKnights[Math.floor(Math.random() * blackKnights.length)];

    if (!blackKnight) {
        return;
    }

    const { world } = player;

    blackKnight.engage(player);
    await blackKnight.say('Die intruder!!');
    await world.sleepTicks(2);
    blackKnight.disengage();
    await blackKnight.attack(player);
}

// Temporary hack
function enterExitOddWall(player, wallObject) {
    player.message('@que@You just went through a secret door');

    if (player.y >= wallObject.y) {
        player.teleport(wallObject.x, wallObject.y - 1);
        return true;
    }

    player.teleport(wallObject.x, wallObject.y);
    return true;
}

async function enterExitSideRoom(player, wallObject) {
    if (player.y >= wallObject.y) {
        player.enterDoor(wallObject); // entering guarded room
        return true;
    }

    await randomBlackKnightAttack(player);

    player.enterDoor(wallObject); // leaving guarded room

    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id === SIDE_DOOR_ID) {
        return await enterExitSideRoom(player, wallObject);
    } else if (wallObject.id === ODD_WALL_ID) {
        return enterExitOddWall(player, wallObject);
    }

	return false;
}

module.exports = { onWallObjectCommandOne, randomBlackKnightAttack };