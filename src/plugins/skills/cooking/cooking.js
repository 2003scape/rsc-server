// https://classic.runescape.wiki/w/Cooking

// using items on ranges or fires

const { rollSkillSuccess } = require('../../../rolls');
const { uncooked } = require('@2003scape/rsc-data/skills/cooking');

const CAKE_TIN_ID = 338;
const COOKS_RANGE_ID = 119;
const FIRE_IDS = new Set([97, 274]);
const RANGE_IDS = new Set([11, 491]);

const COOKS_RANGE_BONUS = 1.05;
const FIRE_PENALTY = 0.95;

function getDefinition(id) {
    const definition = uncooked[id];

    if (definition.reference) {
        return getDefinition(definition.reference);
    }

    return definition;
}

function isMeat(item) {
    return item.definition.sprite === 60;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (!uncooked.hasOwnProperty(item.id)) {
        return false;
    }

    let isRange;
    let isCooksRange = false;

    if (FIRE_IDS.has(gameObject.id)) {
        isRange = false;
    } else if (RANGE_IDS.has(gameObject.id)) {
        isRange = true;
    } else if (gameObject.id === COOKS_RANGE_ID) {
        if (player.questStages.cooksAssistant !== -1) {
            return false;
        }

        isRange = true;
        isCooksRange = true;
    } else {
        return false;
    }

    const cookingLevel = player.skills.cooking.current;

    const {
        level,
        experience,
        cooked: cookedID,
        burnt: burntID,
        roll,
        range: needsRange
    } = getDefinition(item.id);

    let cookedName = item.definition.name
        .toLowerCase()
        .replace('raw ', '')
        .replace('uncooked ', '');

    if (cookingLevel < level) {
        player.message(
            `@que@You need a cooking level of ${level} to cook ${cookedName}`
        );

        return true;
    }

    let cookTicks = 3;

    if (needsRange) {
        cookTicks += 2;

        if (!isRange) {
            player.message('@que@You need a proper oven to cook this');
            return true;
        }
    }

    if (isMeat(item)) {
        cookedName = 'meat';
    }

    if (needsRange) {
        player.message(`You cook the ${cookedName} in the oven...`);
    } else {
        // ( QUEST) You cook the stew on the range...
        // from 08-01-2018 21.50.15 cooking pizza and cake
        // by Tylerberg
        const rangeName = /stew/.test(cookedName) ? 'range' : 'stove';

        // (QUEST) You cook the meat on the stove...
        // (QUEST) You cook the meat on the fire...
        const ellipsis = /(meat|stew)/.test(cookedName) ? '...' : '';

        player.message(
            `You cook the ${cookedName} on the ` +
                `${isRange ? rangeName : 'fire'}${ellipsis}`
        );
    }

    player.sendBubble(item.id);

    if (player.isTired()) {
        player.message('You are too tired to cook this food');
        return true;
    }

    const { world } = player;

    player.sendSound('cooking');
    await world.sleepTicks(cookTicks);

    player.inventory.remove(item.id);

    let lowRoll = roll[0];

    if (!isRange) {
        lowRoll *= FIRE_PENALTY;
    } else if (isCooksRange) {
        lowRoll *= COOKS_RANGE_BONUS;
    }

    const cookSuccess = rollSkillSuccess(lowRoll, roll[1], cookingLevel);

    if (/pie/.test(cookedName)) {
        cookedName = 'pie';
    }

    if (/cake/.test(cookedName)) {
        player.inventory.add(CAKE_TIN_ID);
    }

    if (cookSuccess) {
        player.inventory.add(cookedID);
        player.addExperience('cooking', experience);

        if (needsRange) {
            player.message(`You remove the ${cookedName} from the oven`);
        } else {
            player.message(`The ${cookedName} is now nicely cooked`);
        }
    } else {
        player.inventory.add(burntID);
        player.message(`@que@You accidentially burn the ${cookedName}`);
    }

    return true;
}

module.exports = { onUseWithGameObject };
