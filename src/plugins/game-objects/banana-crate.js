const BANANA_CRATE_ID = 182;
const BANANA_ID = 249;

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== BANANA_CRATE_ID) {
        return false;
    }

    const crateBananas = player.cache.crateBananas || 0;

    if (crateBananas === 0) {
        player.message('The crate is completely empty');
    } else if (crateBananas < 10) {
        player.message('the crate is partially full of bananas');
    } else {
        player.message('The crate is full of bananas');
    }

    return true;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (
        gameObject.id !== BANANA_CRATE_ID ||
        item.id !== BANANA_ID ||
        !player.cache.hasOwnProperty('crateBananas')
    ) {
        return false;
    }

    const crateBananas = player.cache.crateBananas || 0;

    if (crateBananas >= 10) {
        player.message('the crate is already full');
    } else {
        player.inventory.remove(BANANA_ID);
        player.cache.crateBananas += 1;
        player.message('you put a banana in the crate');
    }

    return true;
}

module.exports = { onGameObjectCommandTwo, onUseWithGameObject };
