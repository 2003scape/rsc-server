// https://classic.runescape.wiki/w/Wig

const BLONDE_WIG_ID = 244;
const WIG_ID = 245;
const YELLOW_DYE_ID = 239;

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== WIG_ID || target.id !== YELLOW_DYE_ID) &&
        (item.id !== YELLOW_DYE_ID || target.id !== WIG_ID)
    ) {
        return false;
    }

    player.inventory.remove(WIG_ID);
    player.inventory.remove(YELLOW_DYE_ID);
    player.inventory.add(BLONDE_WIG_ID);
    player.message('You dye the wig blond');

    return true;
}

module.exports = { onUseWithInventory };
