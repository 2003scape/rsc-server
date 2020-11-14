const BANANA_ID = 249;
const KARAMJA_CRATE_ID = 182;
const RUM_ID = 318;
const WYDIN_CRATE_ID = 185;

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id === KARAMJA_CRATE_ID) {
        const crateBananas = player.cache.crateBananas || 0;

        if (crateBananas === 0) {
            player.message('@que@The crate is completely empty');
        } else if (crateBananas < 10) {
            player.message('@que@the crate is partially full of bananas');
        } else {
            player.message('@que@The crate is full of bananas');
        }

        return true;
    }

    if (gameObject.id === WYDIN_CRATE_ID) {
        const { world } = player;

        player.message('@que@There are a lot of bananas in the crate');
        await world.sleepTicks(2);

        if (player.cache.deliveredRum) {
            delete player.cache.deliveredRum;

            player.inventory.add(RUM_ID);

            player.message(
                '@que@You find your bottle of rum amoungst the bananas'
            );

            await world.sleepTicks(2);
        }

        player.message('@que@Do you want to take a banana?');

        const choice = await player.ask(['Yes', 'No'], false);

        if (choice === 0) {
            player.inventory.add(BANANA_ID);
            player.message('@que@you take a banana');
        }

        return true;
    }

    return false;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== KARAMJA_CRATE_ID || item.id !== BANANA_ID) {
        return false;
    }

    if (!player.cache.hasOwnProperty('crateBananas')) {
        player.message('@que@I have no reason to do that');
        return true;
    }

    const crateBananas = player.cache.crateBananas || 0;

    if (crateBananas >= 10) {
        player.message('@que@the crate is already full');
    } else {
        player.inventory.remove(BANANA_ID);
        player.cache.crateBananas += 1;
        player.message('@que@you put a banana in the crate');
    }

    return true;
}

module.exports = { onGameObjectCommandTwo, onUseWithGameObject };
