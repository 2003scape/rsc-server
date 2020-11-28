const CLOSED_CHEST_ID = 82;
const OPEN_CHEST_ID = 81;
const PHOENIX_BROKEN_SHIELD_ID = 53;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id === CLOSED_CHEST_ID) {
        const { world } = player;

        player.message('You open the chest');
        world.replaceEntity('gameObjects', gameObject, OPEN_CHEST_ID);

        return true;
    } else if (gameObject.id === OPEN_CHEST_ID) {
        const { world } = player;

        player.message('@que@You search the chest');
        await world.sleepTicks(3);

        if (
            player.inventory.has(PHOENIX_BROKEN_SHIELD_ID) ||
            player.bank.has(PHOENIX_BROKEN_SHIELD_ID)
        ) {
            player.message('@que@The chest is empty');
        } else {
            player.inventory.add(PHOENIX_BROKEN_SHIELD_ID);
            player.message('@que@You find half a shield which you take');
        }
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== OPEN_CHEST_ID) {
        return false;
    }

    const { world } = player;

    player.message('You close the chest');
    world.replaceEntity('gameObjects', gameObject, CLOSED_CHEST_ID);

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
