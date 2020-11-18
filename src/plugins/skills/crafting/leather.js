// https://classic.runescape.wiki/w/Crafting#Leather_Working

const items = require('@2003scape/rsc-data/config/items');
const { leather } = require('@2003scape/rsc-data/skills/crafting');

const LEATHER_ID = 148;
const NEEDLE_ID = 39;
const THREAD_ID = 43;

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== LEATHER_ID || target.id !== NEEDLE_ID) &&
        (item.id !== NEEDLE_ID || target.id !== LEATHER_ID)
    ) {
        return false;
    }

    if (!player.inventory.has(THREAD_ID)) {
        player.message('You need some thread to make anything out of leather');
        return true;
    }

    const choices = leather.map((entry) => entry.alias);
    choices.push('Cancel');

    const choice = await player.ask(choices, false);

    if (choice === choices.length - 1) {
        return true;
    }

    if (player.isTired()) {
        player.message('You are too tired to craft');
        return true;
    }

    const craftingLevel = player.skills.crafting.current;
    const { level, experience, id } = leather[choice];
    const name = items[id].name;

    if (craftingLevel < level) {
        player.message(
            `You need to have a crafting of level ${level} or higher to make ` +
                name
        );

        return true;
    }

    player.inventory.remove(LEATHER_ID);
    player.inventory.add(id);
    player.addExperience('crafting', experience);
    player.message(`You make some ${name}`);

    const threadLeft = player.cache.hasOwnProperty('threadLeft')
        ? player.cache.threadLeft
        : 5;

    player.cache.threadLeft = threadLeft - 1;

    if (player.cache.threadLeft < 1) {
        player.message('You use up one of your reels of thread');
        player.inventory.remove(THREAD_ID);
        player.cache.threadLeft = 5;
    }

    return true;
}

module.exports = { onUseWithInventory };
