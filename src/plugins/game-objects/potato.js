const POTATO_GROUND_ID = 191;
const POTATO_ID = 348;

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== POTATO_GROUND_ID) {
        return false;
    }

    player.inventory.add(POTATO_ID);
    player.message('You pick a potato');
    player.sendSound('potato');
    return true;
}

module.exports = { onGameObjectCommandTwo };
