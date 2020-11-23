// Fancy looking gameObject doors that are always locked

const LOCKED_DOOR_ID = 142;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== LOCKED_DOOR_ID) {
        return false;
    }

    player.message('@que@the doors are locked');
    return true;
}

module.exports = { onGameObjectCommandOne };