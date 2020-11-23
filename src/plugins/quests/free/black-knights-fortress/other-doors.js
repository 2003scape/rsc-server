const BLACK_KNIGHT_ID = 66;

const ODD_WALL_ID = 22;
const SIDE_DOOR_ID = 40;

const BLOCKBLANK_ID = 86;

async function randomBlackKnightAttack(player) {
    // Even the ones outside yell at you sometimes
    const blackKnights = player
        .getNearbyEntitiesByID('npcs', BLACK_KNIGHT_ID, 12)
        .filter((npc) => {
            return !npc.locked && player.localEntities.known.npcs.has(npc);
        });

    if (!blackKnights.length) {
        player.fortressDoorOpen = true;
        return;
    }

    const blackKnight =
        blackKnights[Math.floor(Math.random() * blackKnights.length)];

    if (!blackKnight) {
        player.fortressDoorOpen = true;
        return;
    }

    const { world } = player;

    player.engage(blackKnight);
    await blackKnight.say('Die intruder!!');
    player.disengage();
    player.lock();

    blackKnight.attack(player).then(() => {
        delete player.fortressDoorOpen;
    });

    await world.sleepTicks(2);

    if (!player.opponent) {
        player.unlock();
    }

    player.fortressDoorOpen = true;

    world.setTickTimeout(() => {
        delete player.fortressDoorOpen;
    }, 2);
}

async function enterExitOddWall(player, wallObject) {
    player.message('@que@You just went through a secret door');
    await player.enterDoor(wallObject, BLOCKBLANK_ID);
    return true;
}

async function enterExitSideRoom(player, wallObject) {
    if (player.y >= wallObject.y) {
        await player.enterDoor(wallObject);
    } else {
        const { world } = player;

        if (player.fortressDoorOpen) {
            delete player.fortressDoorOpen;
            await player.enterDoor(wallObject);
            await world.sleepTicks(2);
        } else {
            await randomBlackKnightAttack(player);
        }
    }
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id === SIDE_DOOR_ID) {
        await enterExitSideRoom(player, wallObject);
        return true;
    } else if (wallObject.id === ODD_WALL_ID) {
        await enterExitOddWall(player, wallObject);
        return true;
    }

    return false;
}

module.exports = { onWallObjectCommandOne, randomBlackKnightAttack };

