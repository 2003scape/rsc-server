const OYSTER_EMPTY_ID = 791;
const OYSTER_ID = 793;
const OYSTER_PEARLS_ID = 792;

async function onItemCommand(player, item) {
    if (item.id !== OYSTER_ID) {
        return false;
    }

    player.inventory.remove(OYSTER_ID);
    player.message('you open the oyster shell');

    const roll = Math.floor(Math.random() * 10);
    player.inventory.add(roll == 0 ? OYSTER_PEARLS_ID : OYSTER_EMPTY_ID);
    await player.sendInventory();

    return true;
}

module.exports = { onItemCommand };
