const Item = require('../../model/item');

const BUCKET_ID = 21;
const SOURCE_IDS = new Set([26, 48, 86, 1130]);
const WELL_IDS = new Set([2, 466, 814]);

async function onUseWithGameObject(player, gameObject, item) {
    const refilledID = Item.getFullWater(item.id);

    if (
        typeof refilledID === 'undefined' ||
        (WELL_IDS.has(gameObject.id) && item.id !== BUCKET_ID) &&
        !SOURCE_IDS.has(gameObject.id)
    ) {
        return false;
    }

    const { world } = player;

    player.sendBubble(item.id);
    player.sendSound('filljug');
    await world.sleepTicks(2);

    player.inventory.remove(item.id);
    player.inventory.add(refilledID);

    player.message(
        `You fill the ${item.definition.name.toLowerCase()} from the ` +
            gameObject.definition.name.toLowerCase()
    );

    return true;
}

module.exports = { onUseWithGameObject };
