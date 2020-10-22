const { buryExperience } = require('@2003scape/rsc-data/skills/prayer');

const BONE_IDS = new Set(Object.keys(buryExperience).map(Number));

async function onItemCommand(player, item) {
    if (!BONE_IDS.has(item.id)) {
        return false;
    }

    const { world } = player;

    player.setBusy(true);

    player.message('You dig a hole in the ground');
    await player.inventory.remove(item);
    player.addExperience('prayer', buryExperience[item.id])
    player.message(`You bury the ${item.definition.name.toLowerCase()}`);
    await world.sleepTicks(1);

    player.setBusy(false);

    return true;
}

module.exports = { onItemCommand };
