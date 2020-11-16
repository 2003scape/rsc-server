// https://classic.runescape.wiki/w/Dye

const DYE_MIX_IDS = [
    // red + blue = purple
    { dye: 238, withDye: 272, result: 516 },
    // blue + yellow = green
    { dye: 272, withDye: 239, result: 515 },
    // red + yellow = orange
    { dye: 238, withDye: 239, result: 282 }
];

async function onUseWithInventory(player, item, target) {
    for (const { dye, withDye, result } of DYE_MIX_IDS) {
        if (
            (item.id === dye && target.id === withDye) ||
            (item.id === withDye && target.id === dye)
        ) {
            player.inventory.remove(dye);
            player.inventory.remove(withDye);
            player.inventory.add(result);
            player.message('You mix the dyes');
            return true;
        }
    }

    return false;
}

module.exports = { onUseWithInventory };
