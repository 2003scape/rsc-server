// https://classic.runescape.wiki/w/Crafting#Pottery

const items = require('@2003scape/rsc-data/config/items');
const { pottery } = require('@2003scape/rsc-data/skills/crafting');
const { rollSkillSuccess } = require('../../../rolls');

// { fullID: emptyID }
const WATER_IDS = {
    141: 140,
    50: 21
};

const CLAY_ID = 149;
const POTTERY_OVEN_ID = 178;
const POTTERY_WHEEL_ID = 179;
const SOFT_CLAY_ID = 243;

// { unfiredID: { id, experience, roll, alias } }
const FIRED_POTTERY = {};

for (const {
    fired,
    unfired: { id: unfiredID },
    alias,
    roll
} of pottery) {
    FIRED_POTTERY[unfiredID] = { ...fired, roll, alias };
}

const UNFIRED_POTTERY_IDS = new Set(pottery.map((entry) => entry.unfired.id));

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== CLAY_ID || !WATER_IDS.hasOwnProperty(target.id)) &&
        (!WATER_IDS.hasOwnProperty(item.id) || target.id !== CLAY_ID)
    ) {
        return false;
    }

    player.lock();

    const { world } = player;
    const waterID = item.id === CLAY_ID ? target.id : item.id;

    player.inventory.remove(CLAY_ID);
    player.inventory.remove(waterID);
    player.message('@que@You mix the clay and water');
    await world.sleepTicks(2);

    player.message('You now have some soft workable clay');
    player.inventory.add(WATER_IDS[waterID]);
    player.inventory.add(SOFT_CLAY_ID);

    player.unlock();

    return true;
}

async function doMoulding(player) {
    player.message('What would you like to make?');

    const choices = pottery.map((entry) => {
        const name = items[entry.fired.id].name;
        return name[0].toUpperCase() + name.slice(1);
    });

    const choice = await player.ask(choices, false);

    const {
        level,
        unfired: { id, experience },
        alias
    } = pottery[choice];

    const craftingLevel = player.skills.crafting.current;

    if (craftingLevel < level) {
        player.message(
            `@que@You need to have a crafting level of ${level} or higher to ` +
                `make ${alias}`
        );

        return;
    }

    if (player.isTired()) {
        player.message('You are too tired to craft');
        return;
    }

    player.sendBubble(SOFT_CLAY_ID);
    player.inventory.remove(SOFT_CLAY_ID);

    const name = items[id].name.toLowerCase().replace('unfired ', '');
    player.message(`you make the clay into a ${name}`);

    player.inventory.add(id);
    player.addExperience('crafting', experience);
}

async function doFiring(player, item) {
    const { world } = player;
    const name = items[item.id].name.toLowerCase().replace('unfired ', '');

    player.message(`@que@You put the ${name} in the oven`);
    await world.sleepTicks(3);

    const { level, id, experience, roll, alias } = FIRED_POTTERY[item.id];

    const craftingLevel = player.skills.crafting.current;

    if (craftingLevel < level) {
        player.message(
            `@que@You need to have a crafting level of ${level} or higher to ` +
                `make ${alias}`
        );

        return;
    }

    if (player.isTired()) {
        player.message('You are too tired to craft');
        return;
    }

    player.sendBubble(item.id);
    player.inventory.remove(item.id);

    const fireSuccess = rollSkillSuccess(roll[0], roll[1], craftingLevel);

    if (fireSuccess) {
        player.message(`@que@the ${name} hardens in the oven`);
        await world.sleepTicks(3);
        player.message(`@que@You remove a ${name} from the oven`);
        player.inventory.add(id);
        player.addExperience('crafting', experience);
    } else {
        player.message(
            `@que@The ${name} cracks in the oven, you throw it away`
        );
    }
}

async function onUseWithGameObject(player, gameObject, item) {
    if (item.id === SOFT_CLAY_ID && gameObject.id === POTTERY_WHEEL_ID) {
        await doMoulding(player);
        return true;
    }

    if (gameObject.id === POTTERY_OVEN_ID && UNFIRED_POTTERY_IDS.has(item.id)) {
        await doFiring(player, item);
        return true;
    }

    return false;
}

module.exports = { onUseWithInventory, onUseWithGameObject };
