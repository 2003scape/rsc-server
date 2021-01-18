const SLEEPING_BAG_ID = 1263;

async function onInventoryCommand(player, item) {
    if (item.id !== SLEEPING_BAG_ID) {
        return false;
    }

    player.displayFatigue = player.fatigue;
    player.openSleep(false);

    return true;
}

module.exports = { onInventoryCommand };
