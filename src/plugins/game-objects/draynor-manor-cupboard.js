const OPEN_CUPBOARD_ID = 71;
const CLOSED_CUPBOARD_ID = 56;

async function onGameObjectCommandOne(player, gameObject) {
    const { world } = player;

    if (gameObject.id === OPEN_CUPBOARD_ID) {
        player.message('You search the cupboard', 'The cupboard is empty');
        return true;
    }

    if (gameObject.id === CLOSED_CUPBOARD_ID) {
        world.replaceEntity('gameObjects', gameObject, OPEN_CUPBOARD_ID);
        player.message('You open the cupboard');
        return true;
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== OPEN_CUPBOARD_ID) {
        return false;
    }

    const { world } = player;

    world.replaceEntity('gameObjects', gameObject, CLOSED_CUPBOARD_ID);
    player.message('You close the cupboard');

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
