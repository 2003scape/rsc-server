const CHEST_CLOSED_ID = 187;
const CHEST_KEY_ID = 382;
const CHEST_OPEN_ID = 186;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== CHEST_CLOSED_ID) {
        return false;
    }

    player.message('The chest is locked');

    return true;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (
        gameObject.id !== CHEST_CLOSED_ID ||
        item.id !== CHEST_KEY_ID ||
        player.questStages.piratesTreasure !== 2
    ) {
        return false;
    }

    const { world } = player;

    player.message('You unlock the chest');

    const openChest = world.replaceEntity(
        'gameObjects',
        gameObject,
        CHEST_OPEN_ID
    );

    world.setTickTimeout(() => {
        world.replaceEntity('gameObjects', openChest, CHEST_CLOSED_ID);
    }, 5);

    player.message('@que@All that is in the chest is a message');
    await world.sleepTicks(3);
    player.message('@que@You take the message from the chest');
    await world.sleepTicks(3);
    player.message('@que@It says dig just behind the south bench in the park');
    await world.sleepTicks(3);

    player.questStages.piratesTreasure = 3;

    return true;
}

module.exports = { onGameObjectCommandOne, onUseWithGameObject };
