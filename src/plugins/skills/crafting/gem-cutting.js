// https://classic.runescape.wiki/w/Crafting#Gems

const items = require('@2003scape/rsc-data/config/items');
const { cutting } = require('@2003scape/rsc-data/skills/crafting');

const CHISEL_ID = 167;
const UNCUT_GEM_IDS = new Set(Object.keys(cutting).map(Number));

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== CHISEL_ID || !UNCUT_GEM_IDS.has(target.id)) &&
        (!UNCUT_GEM_IDS.has(item.id) || target.id !== CHISEL_ID)
    ) {
        return false;
    }

    const craftingLevel = player.skills.crafting.current;
    const uncutID = item.id === CHISEL_ID ? target.id : item.id;
    const { level, experience, id: cutID, alias } = cutting[uncutID];

    if (craftingLevel < level) {
        const gemName = alias || items[cutID].name;

        player.message(
            `@que@you need a crafting level of ${level} to cut ${gemName}`
        );

        return true;
    }

    player.inventory.remove(uncutID);
    player.inventory.add(cutID);
    player.message(`You cut the ${items[cutID].name.toLowerCase()}`);
    player.sendSound('chisel');
    player.addExperience('crafting', experience);

    return true;
}

module.exports = { onUseWithInventory };
