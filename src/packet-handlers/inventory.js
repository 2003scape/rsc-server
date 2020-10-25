async function inventoryDrop({ player }, { index }) {
    player.endWalkFunction = () => player.inventory.drop(index);
}

module.exports = { inventoryDrop };
