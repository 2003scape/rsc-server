const BLACK_ARM_BROKEN_SHIELD_ID = 54;
const CLOSED_CUPBOARD_ID = 84;
const OPEN_CUPBOARD_ID = 85;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id === OPEN_CUPBOARD_ID) {
        const { world } = player;

        player.message('@que@You search the cupboard');
        await world.sleepTicks(3);

        if (
            player.inventory.has(BLACK_ARM_BROKEN_SHIELD_ID) ||
            player.bank.has(BLACK_ARM_BROKEN_SHIELD_ID)
        ) {
            player.message('@que@The cupboard is empty');
        } else {
            player.inventory.add(BLACK_ARM_BROKEN_SHIELD_ID);
            player.message('@que@You find half a shield which you take');
        }

        return true;
    }

    if (gameObject.id === CLOSED_CUPBOARD_ID) {
        const { world } = player;

        world.replaceEntity('gameObjects', gameObject, OPEN_CUPBOARD_ID);
        player.message('You open the cupboard');
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
