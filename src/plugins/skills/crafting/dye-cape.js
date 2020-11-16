// https://classic.runescape.wiki/w/Cape

const BLACK_CAPE_ID = 209;

// { dyeID: capeID }
const DYE_CAPE_IDS = {
    // red
    238: 183,
    // orange
    292: 513,
    // yellow
    239: 512,
    // green
    515: 511,
    // blue
    272: 229,
    // purple
    516: 514
};

const DYE_IDS = new Set(Object.keys(DYE_CAPE_IDS).map(Number));

const CAPE_IDS = new Set(Object.values(DYE_CAPE_IDS));
CAPE_IDS.add(BLACK_CAPE_ID);

async function onUseWithInventory(player, item, target) {
    let capeID = -1;
    let dyeID = -1;

    if (CAPE_IDS.has(item.id) && DYE_IDS.has(target.id)) {
        capeID = item.id;
        dyeID = target.id;
    } else if (CAPE_IDS.has(target.id) && DYE_IDS.has(item.id)) {
        capeID = target.id;
        dyeID = item.id;
    }

    if (capeID > -1) {
        player.inventory.remove(capeID);
        player.inventory.remove(dyeID);
        player.inventory.add(DYE_CAPE_IDS[dyeID]);
        player.addExperience('crafting', 10);
        player.message('You dye the Cape');
        return true;
    }

    return false;
}

module.exports = { onUseWithInventory };
