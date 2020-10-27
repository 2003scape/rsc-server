async function groundItemTake({ player }, { x, y, id }) {
    player.endWalkFunction = () => {
        const { world } = player;

        if (player.inventory.items.length >= 30) {
            return;
        }

        const items = world.groundItems.getAtPoint(x, y);

        for (const item of items) {
            if (!item.withinRange(player, 2)) {
                player.message("I can't reach that!");
                return;
            }

            if (item.id === id && (!item.owner || item.owner === player.id)) {
                player.sendSound('takeobject');
                player.inventory.add(item);
                world.removeEntity('groundItems', item);
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
