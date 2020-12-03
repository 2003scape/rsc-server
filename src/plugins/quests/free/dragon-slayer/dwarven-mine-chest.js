const CLOSED_CHEST_ID = 231;
const OPEN_CHEST_ID = 230;
const THIRD_MAP_PIECE_ID = 418;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id === OPEN_CHEST_ID) {
        if (
            player.cache.dwarvenChestMapPiece &&
            !player.inventory.has(THIRD_MAP_PIECE_ID)
        ) {
            delete player.cache.dwarvenChestMapPiece;
            player.inventory.add(THIRD_MAP_PIECE_ID);
            player.message('You find a piece of map in the chest');
        } else {
            player.message('You find nothing in the chest');
        }

        return true;
    } else if (gameObject.id === CLOSED_CHEST_ID) {
        const { world } = player;

        world.replaceEntity('gameObjects', gameObject, OPEN_CHEST_ID);
        player.message('You open the chest');

        return true;
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== OPEN_CHEST_ID) {
        return false;
    }

    const { world } = player;

    world.replaceEntity('gameObjects', gameObject, CLOSED_CHEST_ID);
    player.message('You close the chest');

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
