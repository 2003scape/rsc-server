const DOOR_ID = 21;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const blackArmStage = player.cache.blackArmStage || 0;

    if (blackArmStage === -1) {
        player.message(
            'You hear the door being unbarred',
            'You go through the door'
        );

        await player.enterDoor(wallObject);
    } else {
        player.message("The door won't open");
    }

    return true;
}

module.exports = { onWallObjectCommandOne };
