// https://classic.runescape.wiki/w/Manhole

const MANHOLE_CLOSED_ID = 78;
const MANHOLE_OPEN_ID = 79;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== MANHOLE_CLOSED_ID) {
        return false;
    }

    const { world } = player;

    player.message('@que@You slide open the manhole cover');
    world.replaceEntity('gameObjects', gameObject, MANHOLE_OPEN_ID);

    return true;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== MANHOLE_OPEN_ID) {
        return false;
    }

    const { world } = player;

    player.message('@que@You slide the cover back over the manhole');
    world.replaceEntity('gameObjects', gameObject, MANHOLE_CLOSED_ID);

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
