const FLOUR_HEAP_ID = 23;
const FLOUR_ID = 136;
const GRAIN_ID = 29;
const POT_ID = 135;

// each location uses a different hopper ID
// { hopperID: locationOfFlourHeap }
const CHUTE_LOCATIONS = {
    // draynor
    52: { x: 166, y: 599 },
    // cooks guild
    173: { x: 179, y: 481 },
    // zanaris
    246: { x: 162, y: 3533 },
    // ardougne
    343: { x: 565, y: 532 }
};

async function onUseWithGameObject(player, gameObject, item) {
    if (item.id !== GRAIN_ID || !CHUTE_LOCATIONS[gameObject.id]) {
        return false;
    }

    const hopperCache = player.cache.hoppers || {};

    if (hopperCache[gameObject.id]) {
        player.message('There is already grain in the hopper');
    } else {
        player.inventory.remove(GRAIN_ID);
        hopperCache[gameObject.id] = true;
        player.cache.hoppers = hopperCache;
        player.message('You put the grain in the hopper');
    }

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    const chuteLocation = CHUTE_LOCATIONS[gameObject.id];

    if (!chuteLocation) {
        return false;
    }

    const { world } = player;

    player.message('You operate the hopper');
    player.sendSound('mechanical');

    await world.sleepTicks(2);

    const hopperCache = player.cache.hoppers || {};

    if (hopperCache[gameObject.id]) {
        delete hopperCache[gameObject.id];

        // just in case we left grain in a different hopper
        if (!Object.keys(hopperCache).length) {
            delete player.cache.hoppers;
        } else {
            player.cache.hoppers = hopperCache;
        }

        player.message('The grain slides down the chute');

        const { x, y } = chuteLocation;

        world.addPlayerDrop(player, { id: FLOUR_HEAP_ID }, x, y);
    } else {
        player.message('Nothing interesting happens');
    }

    return true;
}

async function onGroundItemTake(player, groundItem) {
    if (groundItem.id !== FLOUR_HEAP_ID) {
        return false;
    }

    player.message("I can't pick it up!", 'I need a pot to hold it in');

    return true;
}

async function onUseWithGroundItem(player, groundItem, item) {
    if (groundItem.id !== FLOUR_HEAP_ID || item.id !== POT_ID) {
        return false;
    }

    const { world } = player;

    world.removeEntity('groundItems', groundItem);
    player.inventory.remove(POT_ID);
    player.inventory.add(FLOUR_ID);
    player.message('You put the flour in the pot');

    return true;
}

module.exports = {
    onUseWithGameObject,
    onGameObjectCommandOne,
    onGroundItemTake,
    onUseWithGroundItem
};
