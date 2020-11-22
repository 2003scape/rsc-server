const CLOSED_CUPBOARD_ID = 140;
const GARLIC_ID = 218;
const OPEN_CUPBOARD_ID = 141;

async function onGameObjectCommandOne(player, gameObject) {
    const { world } = player;

    if (gameObject.id === OPEN_CUPBOARD_ID) {
        player.message('You search the cupboard');

        if (player.inventory.has(GARLIC_ID)) {
            player.message('The cupboard is empty');
        } else {
            player.inventory.add(GARLIC_ID);
            player.message('You find a clove of garlic that you take');
        }

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
