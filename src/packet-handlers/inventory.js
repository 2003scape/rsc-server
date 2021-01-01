function getGroundItem(player, id, x, y) {
    const { world } = player;

    const groundItems = world.groundItems.getAtPoint(x, y);

    for (const groundItem of groundItems) {
        if (!groundItem.withinRange(player, 2, true)) {
            player.message("I can't reach that!");
            return;
        }

        if (
            groundItem.id === id &&
            (!groundItem.owner || groundItem.owner === player.id)
        ) {
            return groundItem;
        }
    }
}

async function groundItemTake({ player }, { x, y, id }) {
    if (player.locked) {
        return;
    }

    player.endWalkFunction = async () => {
        if (player.locked) {
            return;
        }

        const { world } = player;
        const groundItem = getGroundItem(player, id, x, y);

        if (!groundItem) {
            return;
        }

        if (
            player.inventory.isFull() &&
            (!groundItem.definition.stackable ||
                !player.inventory.has(groundItem.id))
        ) {
            return;
        }

        player.lock();
        player.faceEntity(groundItem);

        const blocked = await world.callPlugin(
            'onGroundItemTake',
            player,
            groundItem
        );

        player.unlock();

        if (blocked) {
            return;
        }

        world.removeEntity('groundItems', groundItem);
        player.inventory.add(groundItem);
        player.sendSound('takeobject');
    };
}

async function inventoryDrop({ player }, { index }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const blocked = await world.callPlugin(
            'onDropItem',
            player,
            player.inventory.items[index]
        );

        if (!blocked) {
            player.inventory.drop(index);
        }
    }
}

async function inventoryWear({ player }, { index }) {
    player.sendSound('click');
    player.inventory.equip(index);
}

async function inventoryUnequip({ player }, { index }) {
    player.sendSound('click');
    player.inventory.unequip(index);
}

async function useWithGroundItem({ player }, { x, y, groundItemID, index }) {
    if (player.locked) {
        return;
    }

    player.endWalkFunction = async () => {
        if (player.locked) {
            return;
        }

        const item = player.inventory.items[index];

        if (!item) {
            throw new RangeError(
                `${player} used invalid item index on ground item`
            );
        }

        const { world } = player;

        if (item.definition.members && !world.members) {
            return;
        }

        const groundItem = getGroundItem(player, groundItemID, x, y);

        if (!groundItem) {
            return;
        }

        player.lock();
        player.faceEntity(groundItem);

        const blocked = await world.callPlugin(
            'onUseWithGroundItem',
            player,
            groundItem,
            item
        );

        player.unlock();

        if (blocked) {
            return;
        }

        player.message('Nothing interesting happens');
    };
}

async function inventoryCommand({ player }, { index }) {
    if (player.locked) {
        return;
    }

    const item = player.inventory.items[index];

    if (!item) {
        throw new RangeError(`${player} used invalid item index for command`);
    }

    const { world } = player;

    // prevent burying dragon bones on f2p worlds etc.
    if (item.definition.members && !world.members) {
        return;
    }

    player.lock();
    await world.callPlugin('onInventoryCommand', player, item);
    player.unlock();
}

async function useWithInventoryItem({ player }, { index, withIndex }) {
    if (player.locked) {
        return;
    }

    const item = player.inventory.items[index];

    if (!item) {
        throw new RangeError(`${player} used invalid item index for useWith`);
    }

    const target = player.inventory.items[withIndex];

    if (!target) {
        throw new RangeError(`${player} used invalid target index for useWith`);
    }

    const { world } = player;

    if (
        !world.members &&
        (item.definition.members || target.definition.members)
    ) {
        player.message('Nothing interesting happens');
        return;
    }

    player.lock();

    const blocked = await world.callPlugin(
        'onUseWithInventory',
        player,
        item,
        target
    );

    if (!blocked) {
        player.message('Nothing interesting happens');
    }

    player.unlock();
}

module.exports = {
    groundItemTake,
    inventoryDrop,
    inventoryWear,
    inventoryUnequip,
    useWithGroundItem,
    inventoryCommand,
    useWithInventoryItem
};
