const HOLE_ID = 154;

const CABBAGE_ID = 18; // right cababge
const DYR_CABBAGE_ID = 228; // wrong cabbage

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== HOLE_ID) {
        return false;
    }

    const { world } = player;

    if (
        player.questStages.blackKnightsFortress !== 2 ||
        (item.id !== CABBAGE_ID && item.id !== DYR_CABBAGE_ID)
    ) {
        // would using a non-cabbage item actually give
        // "nothing interesting happens" in the original?
        await player.say('Why would I want to do that?');
        return true;
    }

    if (item.id === DYR_CABBAGE_ID) {
        player.message('This is the wrong sort of cabbage!');
        await world.sleepTicks(3);
        player.message('You are meant to be hindering the witch.');
        await world.sleepTicks(3);
        player.message('Not helping her.');
    } else if (item.id === CABBAGE_ID) {
        player.inventory.remove(CABBAGE_ID);
        player.message('You drop a cabbage down the hole.');
        await world.sleepTicks(3);
        player.message('The cabbage lands in the cauldron below.');
        await world.sleepTicks(3);
        player.message('The mixture in the cauldron starts to froth and bubble.');
        await world.sleepTicks(3);
        player.message('You hear the witch groan in dismay.');
        await world.sleepTicks(3);
        await player.say("Right I think that's successfully sabotaged the secret weapon.");

        player.questStages.blackKnightsFortress = 3;
    }

    return true;
}

module.exports = { onUseWithGameObject };