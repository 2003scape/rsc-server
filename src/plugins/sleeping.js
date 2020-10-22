const BED_IDS = new Set([14, 15, 641, 1035, 1162, 1171, 1182]);
const COMMANDS = new Set(['rest', 'sleep', 'lie in']);
const SLEEPING_BAG_ID = 1263;

async function onItemCommand(player, item) {
    if (item.id !== SLEEPING_BAG_ID) {
        return false;
    }

    player.openSleep(false);
    return true;
}

async function onGameObjectCommand(player, gameObject, command) {
    if (!COMMANDS.has(command) || !BED_IDS.has(gameObject.id)) {
        return false;
    }

    player.openSleep(true);
    return true;
}

module.exports = { onItemCommand, onGameObjectCommand };
