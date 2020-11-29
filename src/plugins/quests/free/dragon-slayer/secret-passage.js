const DOOR_ID = 58;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    return true;
}

module.exports = { onWallObjectCommandOne };
