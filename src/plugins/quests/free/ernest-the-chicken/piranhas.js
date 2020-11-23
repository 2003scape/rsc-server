// https://classic.runescape.wiki/w/Fish_Food
// https://classic.runescape.wiki/w/Fountain_(Draynor_Manor)
// https://classic.runescape.wiki/w/Poisoned_fish_food

const FISH_FOOD_ID = 176;
const FOUNTAIN_ID = 86;
const POISONED_FISH_FOOD_ID = 178;
const POISON_ID = 177;
const PRESSURE_GAUGE_ID = 175;

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== POISON_ID || target.id !== FISH_FOOD_ID) &&
        (item.id !== FISH_FOOD_ID || target.id !== POISON_ID)
    ) {
        return false;
    }

    player.inventory.remove(POISON_ID);
    player.inventory.remove(FISH_FOOD_ID);
    player.inventory.add(POISONED_FISH_FOOD_ID);
    player.message('You poison the fish food');

    return true;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== FOUNTAIN_ID) {
        return false;
    }

    const { world } = player;

    const killedPiranhas =
        player.cache.killedPiranhas ||
        player.questStages.ernestTheChicken === -1;

    if (item.id === FISH_FOOD_ID) {
        player.inventory.remove(FISH_FOOD_ID);
        player.message('@que@You pour the fish food into the fountain');
        await world.sleepTicks(3);

        if (!killedPiranhas) {
            player.message('@que@You see the pirhanas eating the food');
            await world.sleepTicks(3);
            player.message('@que@The pirhanas seem hungrier than ever');
        }

        return true;
    } else if (item.id === POISONED_FISH_FOOD_ID) {
        player.inventory.remove(POISONED_FISH_FOOD_ID);

        player.message(
            '@que@You pour the poisoned fish food into the fountain'
        );

        await world.sleepTicks(3);

        if (!killedPiranhas) {
            player.message('@que@You see the pirhanas eating the food');
            await world.sleepTicks(3);

            player.message(
                '@que@The pirhanas drop dead and float to the surface'
            );

            player.cache.killedPiranhas = true;
        }
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== FOUNTAIN_ID) {
        return false;
    }

    const questStage = player.questStages.ernestTheChicken;
    const killedPiranhas = player.cache.killedPiranhas || questStage === -1;

    if (!killedPiranhas) {
        await player.say(
            'There seems to be a pressure gauge in here',
            'There are a lot of Pirhanas in there though',
            "I can't get the gauge out"
        );
    } else if (
        killedPiranhas &&
        questStage !== -1 &&
        !player.inventory.has(PRESSURE_GAUGE_ID)
    ) {
        await player.say(
            'There seems to be a pressure gauge in here',
            'There are also some dead fish'
        );

        player.inventory.add(PRESSURE_GAUGE_ID);
        player.message('you get the pressure gauge from the fountain');
    } else {
        player.message("It's full of dead fish");
    }

    return true;
}

module.exports = {
    onUseWithInventory,
    onUseWithGameObject,
    onGameObjectCommandTwo
};
