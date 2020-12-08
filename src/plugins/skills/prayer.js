const { buryExperience } = require('@2003scape/rsc-data/skills/prayer');

const BONE_IDS = new Set(Object.keys(buryExperience).map(Number));

async function onInventoryCommand(player, item) {
    if (!BONE_IDS.has(item.id)) {
        return false;
    }

    const { world } = player;

    player.message('@que@You dig a hole in the ground');
    await world.sleepTicks(1);

    player.inventory.remove(item.id);
    player.addExperience('prayer', buryExperience[item.id]);
    player.message(`@que@You bury the ${item.definition.name.toLowerCase()}`);

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.definition.commands[0] !== 'Recharge at') {
        return false;
    }

    if (player.skills.prayer.current >= player.skills.prayer.base) {
        player.message('@que@You already have full prayer points');
    } else {
        player.skills.prayer.current = player.skills.prayer.base;
        player.sendStats();

        player.message('@que@You recharge your prayer points');
        player.sendSound('recharge');
    }

    return true;
}

module.exports = { onInventoryCommand, onGameObjectCommandOne };
