const EMERALD_ID = 163;
const FLOWER_ID = 188;
const GOLD_RING_ID = 283;
const SPADE_ID = 211;
const WYSON_ID = 116;

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== FLOWER_ID || item.id !== SPADE_ID) {
        return false;
    }

    const { world } = player;
    const wyson = world.npcs.getByID(WYSON_ID);
    const questStage = player.questStages.piratesTreasure;

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

        player.questStages.piratesTreasure = -1;
        player.addQuestPoints(2);
        player.message('@gre@You haved gained 2 quest points!');
    } else {
        player.questStages.piratesTreasure = 4;

        player.engage(wyson);
        await wyson.say('Hey leave off my flowers');
        player.disengage();
        await wyson.attack(player);
    }

    return true;
}

module.exports = { onUseWithGameObject };
