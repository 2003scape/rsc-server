const items = require('@2003scape/rsc-data/config/items');
const { stringing } = require('@2003scape/rsc-data/skills/crafting');

const BALL_OF_WOOL_ID = 207;
const UNSTRUNG_IDS = new Set(Object.keys(stringing).map(Number));

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== BALL_OF_WOOL_ID || !UNSTRUNG_IDS.has(target.id)) &&
        (!UNSTRUNG_IDS.has(item.id) || target.id !== BALL_OF_WOOL_ID)
    ) {
        return false;
    }

    const unstrungID = item.id === BALL_OF_WOOL_ID ? target.id : item.id;
    const strungID = stringing[unstrungID];

    player.inventory.remove(unstrungID);
    player.inventory.remove(BALL_OF_WOOL_ID);

    player.message(
        `You put some string on your ${items[unstrungID].name.toLowerCase()}`
    );

    player.inventory.add(strungID);

    return true;
}

module.exports = { onUseWithInventory };
