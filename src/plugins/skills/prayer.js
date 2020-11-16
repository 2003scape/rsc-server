const { buryExperience } = require('@2003scape/rsc-data/skills/prayer');

const BONE_IDS = new Set(Object.keys(buryExperience).map(Number));

async function onInventoryCommand(player, item) {
    if (!BONE_IDS.has(item.id)) {
        return false;
    }

    const { world } = player;

    player.lock();

    player.message('@que@You dig a hole in the ground');
    await world.sleepTicks(2);

    player.inventory.remove(item);
    player.addExperience('prayer', buryExperience[item.id])
    player.message(`@que@You bury the ${item.definition.name.toLowerCase()}`);

    player.unlock();

    return true;
}

module.exports = { onInventoryCommand };
