const HOLE_ID = 154;

const CABBAGE_ID = 18; // right cababge
const DRAYNOR_CABBAGE_ID = 228; // wrong cabbage

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== HOLE_ID) {
        return false;
    }

    const { world } = player;

    if (
        player.questStages.blackKnightsFortress !== 2 ||
        (item.id !== CABBAGE_ID && item.id !== DRAYNOR_CABBAGE_ID)
    ) {
        // would using a non-cabbage item actually give
        // "nothing interesting happens" in the original?
        await player.say('Why would I want to do that?');
        return true;
    }

    if (item.id === DRAYNOR_CABBAGE_ID) {
        player.message('@que@This is the wrong sort of cabbage!');
        await world.sleepTicks(3);
        player.message('@que@You are meant to be hindering the witch.');
        await world.sleepTicks(3);
        player.message('@que@Not helping her.');
    } else if (item.id === CABBAGE_ID) {
        player.inventory.remove(CABBAGE_ID);

        player.message('@que@You drop a cabbage down the hole.');
        await world.sleepTicks(3);
        player.message('@que@The cabbage lands in the cauldron below.');
        await world.sleepTicks(3);

        player.message(
            '@que@The mixture in the cauldron starts to froth and bubble.'
        );

        await world.sleepTicks(3);

        player.message('@que@You hear the witch groan in dismay.');
        await world.sleepTicks(3);

        await player.say(
            "Right I think that's successfully sabotaged the secret weapon."
        );

        player.questStages.blackKnightsFortress = 3;
    }

    return true;
}

module.exports = { onUseWithGameObject };

