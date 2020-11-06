const GRAIN_ID = 29;
const WHEAT_ID = 72;

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== WHEAT_ID) {
        return false;
    }

    player.message('You get some grain');
    player.inventory.add(GRAIN_ID);
    player.sendSound('potato');
}

module.exports = { onGameObjectCommandTwo };
