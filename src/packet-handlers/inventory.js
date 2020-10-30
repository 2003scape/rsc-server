async function groundItemTake({ player }, { x, y, id }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        if (player.inventory.items.length >= 30) {
            return;
        }

        const groundItems = world.groundItems.getAtPoint(x, y);

        for (const groundItem of groundItems) {
            if (!groundItem.withinRange(player, 2)) {
                player.message("I can't reach that!");
                return;
            }

            if (
                groundItem.id === id &&
                (!groundItem.owner || groundItem.owner === player.id)
            ) {
                player.faceEntity(groundItem);

                const blocked = await world.callPlugin(
                    'onGroundItemTake',
                    player,
                    groundItem
                );

                if (blocked) {
                    return;
                }

                player.inventory.add(groundItem);
                world.removeEntity('groundItems', groundItem);
                player.sendSound('takeobject');
                return;
            }
        }
    };
}

async function inventoryDrop({ player }, { index }) {
    player.endWalkFunction = () => player.inventory.drop(index);
}

async function inventoryWear({ player }, { index }) {
    player.sendSound('click');
    player.inventory.equip(index);
}

async function inventoryUnequip({ player }, { index }) {
    player.sendSound('click');
    player.inventory.unequip(index);
}

module.exports = {
    groundItemTake,
    inventoryDrop,
    inventoryWear,
    inventoryUnequip
};
