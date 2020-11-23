const EMERALD_ID = 163;
const FLOWER_ID = 188;
const GOLD_RING_ID = 283;
const SPADE_ID = 211;
const WYSON_ID = 116;

async function onUseWithGameObject(player, gameObject, item) {
    const questStage = player.questStages.piratesTreasure;

    if (
        gameObject.id !== FLOWER_ID ||
        item.id !== SPADE_ID ||
        questStage !== 3 ||
        questStage !== 4
    ) {
        return false;
    }

    const { world } = player;
    const wyson = world.npcs.getByID(WYSON_ID);

    if (
        questStage === 4 ||
        !wyson ||
        wyson.locked ||
        !player.localEntities.known.npcs.has(wyson)
    ) {
        player.message('@que@You dig a hole in the ground');
        await world.sleepTicks(2);

        player.message('@que@You find a little bag of treasure');
        player.inventory.add(10, 450);
        player.inventory.add(GOLD_RING_ID);
        player.inventory.add(EMERALD_ID);
        await world.sleepTicks(2);

        player.message(
            '@que@Well done you have completed the pirate treasure quest'
        );

        delete player.cache.deliveredRum;
        delete player.cache.stashedRum;

        player.questStages.piratesTreasure = -1;
        player.addQuestPoints(2);
        player.message('@gre@You haved gained 2 quest points!');
    } else if (questStage === 3) {
        player.questStages.piratesTreasure = 4;

        player.engage(wyson);
        await wyson.say('Hey leave off my flowers');
        player.disengage();

        // TODO make sure this works
        player.lock();
        wyson.attack(player);
        await world.sleepTicks(2);
        player.unlock();
    }

    return true;
}

module.exports = { onUseWithGameObject };
