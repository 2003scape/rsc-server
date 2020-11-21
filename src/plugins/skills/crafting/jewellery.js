// https://classic.runescape.wiki/w/Crafting#Jewellery

const crafting = require('@2003scape/rsc-data/skills/crafting');
const items = require('@2003scape/rsc-data/config/items');

const goldJewellery = crafting['gold-jewellery'];
const silverJewellery = crafting['silver-jewellery'];

const GEM_NAMES = goldJewellery.gems.map((id) => {
    const name = items[id].name;
    return name[0].toUpperCase() + name.slice(1);
});

GEM_NAMES.unshift('Gold');

const FURNACE_ID = 118;
const GOLD_BAR_ID = 172;
const SILVER_BAR_ID = 384;

async function goldMoulding(player) {
    const { world } = player;

    player.message('What would you like to make?');

    const mouldChoices = ['Ring', 'Necklace', 'Amulet'];
    const mouldChoice = await player.ask(mouldChoices, false);
    const resultName = mouldChoices[mouldChoice];
    const mouldID = goldJewellery.moulds[mouldChoice];

    if (!player.inventory.has(mouldID)) {
        player.message(
            `You need a ${items[mouldID].name} to make a ${resultName}`
        );

        return;
    }

    player.message(`What type of ${resultName} would you like to make?`);

    const gemChoices = GEM_NAMES.filter((_, i) => {
        if (i === 0) {
            return true;
        }

        const id = goldJewellery.gems[i - 1];
        return !world.members ? !items[id].members : true;
    });

    const gemChoice = await player.ask(gemChoices, false);
    const gemName = GEM_NAMES[gemChoice];
    const gemID = gemChoice === 0 ? -1 : goldJewellery.gems[gemChoice - 1];

    if (gemID > -1 && !player.inventory.has(gemID)) {
        player.message(`You don't have a ${gemName}.`);
        return;
    }

    const craftingLevel = player.skills.crafting.current;

    const { level, experience, id } = goldJewellery.items[mouldChoice][
        gemChoice
    ];

    if (craftingLevel < level) {
        player.message(
            `@que@You need a crafting level of ${level} to make this`
        );

        return;
    }

    if (player.isTired()) {
        player.message('You are too tired to craft');
        return;
    }

    player.sendBubble(id);

    if (gemID > -1) {
        player.inventory.remove(gemID);
    }

    player.inventory.remove(GOLD_BAR_ID);
    player.message(`You make a ${items[id].name}`);
    player.inventory.add(id);
    player.addExperience('crafting', experience);
}

async function silverMoulding(player) {
    const { world } = player;

    player.message('What would you like to make?');

    const choices = silverJewellery.items
        .filter(({ id }) => {
            return !world.members ? !items[id].members : true;
        })
        .map(({ id, alias }) => {
            return alias || items[id].name;
        });

    const choice = await player.ask(choices, false);
    const mouldID = silverJewellery.moulds[choice];

    if (!player.inventory.has(mouldID)) {
        player.message(
            `You need a ${items[mouldID].name} to make a ${choices[choice]}!`
        );

        return;
    }

    const craftingLevel = player.skills.crafting.current;
    const { level, experience, id } = silverJewellery.items[choice];

    if (craftingLevel < level) {
        player.message(
            `@que@You need a crafting skill of level ${level} to make this`
        );

        return;
    }

    if (player.isTired()) {
        player.message('You are too tired to craft');
        return;
    }

    player.sendBubble(id);
    player.inventory.remove(SILVER_BAR_ID);
    player.message(`You make a ${items[id].name}`);
    player.inventory.add(id);
    player.addExperience('crafting', experience);
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== FURNACE_ID) {
        return false;
    }

    if (item.id === GOLD_BAR_ID) {
        await goldMoulding(player);
        return true;
    }

    if (item.id === SILVER_BAR_ID) {
        await silverMoulding(player);
        return true;
    }

    return false;
}

module.exports = { onUseWithGameObject };
