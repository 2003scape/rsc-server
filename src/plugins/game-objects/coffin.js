// https://classic.runescape.wiki/w/Coffin

const CLOSED_COFFIN_ID = 202;
const OPEN_COFFIN_ID = 203;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id === OPEN_COFFIN_ID) {
        player.message('the coffin is empty.');
    } else if (gameObject.id === CLOSED_COFFIN_ID) {
        const { world } = player;
        world.replaceEntity('gameObjects', gameObject, OPEN_COFFIN_ID);
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== OPEN_COFFIN_ID) {
        return false;
    }

    const { world } = player;
    world.replaceEntity('gameObjects', gameObject, CLOSED_COFFIN_ID);

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
