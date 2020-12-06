// https://classic.runescape.wiki/w/Smithing#Smelting

const items = require('@2003scape/rsc-data/config/items');
const { smelting } = require('@2003scape/rsc-data/skills/smithing');

const BRONZE_BAR_ID = 169;
const COAL_ID = 155;
const FURNACE_ID = 118;
const GOLD_BAR_ID = 172;
const IRON_BAR_ID = 170;
const IRON_ORE = 151;
const SILVER_BAR_ID = 384;
const STEEL_BAR_ID = 171;

const ORE_IDS = new Set();

for (const { ores } of Object.values(smelting)) {
    for (const { id } of ores) {
        ORE_IDS.add(id);
    }
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== FURNACE_ID || !ORE_IDS.has(item.id)) {
        return false;
    }

    let resultBarID = -1;

    // > Coal can be used on a furnace with iron ore in the player's inventory
    // > to smelt steel bars. This does not work with any other bar which
    // > requires coal to create.
    if (item.id === COAL_ID) {
        resultBarID = STEEL_BAR_ID;
    } else {
        barLoop: for (const [barID, { ores }] of Object.entries(smelting)) {
            for (const { id } of ores) {
                if (id === COAL_ID) {
                    continue;
                }

                if (item.id == id) {
                    if (id === IRON_ORE && player.inventory.has(COAL_ID, 2)) {
                        resultBarID = STEEL_BAR_ID;
                    } else {
                        resultBarID = +barID;
                    }

                    break barLoop;
                }
            }
        }
    }

    if (resultBarID === -1) {
        return false;
    }

    const metalName = items[resultBarID].name.toLowerCase().replace(' bar', '');
    const isCraftingBar =
        resultBarID === GOLD_BAR_ID || resultBarID == SILVER_BAR_ID;
    const smithingLevel = player.skills.smithing.current;
    const { level, experience, ores } = smelting[resultBarID];

    player.sendBubble(item.id);

    if (player.isTired()) {
        player.message('You are too tired to smelt this ore');
        return true;
    }

    if (smithingLevel < level) {
        player.message(
            `@que@You need to be at least level-${level} smithing to ` +
                `${isCraftingBar ? 'work' : 'smelt'} ${metalName}`
        );

        if (resultBarID === IRON_BAR_ID) {
            player.message(
                '@que@Practice your smithing using tin and copper to make ' +
                    'bronze'
            );
        }

        return true;
    }

    let missingOreID = -1;
    let missingOreAmount = -1;

    for (const { id, amount } of ores) {
        if (!player.inventory.has(id, amount)) {
            missingOreID = id;
            missingOreAmount = amount;
            break;
        }
    }

    if (missingOreID > -1) {
        const missingOreName = items[missingOreID].name
            .toLowerCase()
            .replace(' ore', '');

        if (resultBarID === BRONZE_BAR_ID) {
            player.message(
                `@que@You also need some ${missingOreName} to make ${metalName}`
            );
        } else if (resultBarID === STEEL_BAR_ID) {
            player.message('@que@You need 1 iron-ore and 2 coal to make steel');
        } else {
            player.message(
                `You need ${missingOreAmount} heaps of ${missingOreName} to ` +
                    `smelt ${metalName}`
            );
        }

        return true;
    }

    const { world } = player;

    let placeMessage;

    if (isCraftingBar) {
        placeMessage = `You place a lump of ${metalName} in the furnace`;
    } else if (resultBarID === IRON_BAR_ID) {
        placeMessage = `You smelt the iron in the furnace`;
    } else if (resultBarID === BRONZE_BAR_ID) {
        placeMessage = 'You smelt the copper and tin in the furnace';
    } else {
        const secondOreAmount = ores[1].amount;
        const secondOreName = items[ores[1].id].name
            .toLowerCase()
            .replace(' ore', '');

        placeMessage =
            `You place the ${metalName} and ${secondOreAmount} heaps of ` +
            `${secondOreName} into the furnace`;
    }

    for (const ore of ores) {
        player.inventory.remove(ore);
    }

    player.message(`@que@${placeMessage}`);
    await world.sleepTicks(3);

    if (resultBarID === IRON_BAR_ID) {
        if (Math.random() >= 0.5) {
            player.message('The ore is too impure and you fail to refine it');
            return true;
        }
    }

    player.addExperience('smithing', experience);
    player.inventory.add(resultBarID);
    player.message(`@que@You retrive a bar of ${metalName}`);

    return true;
}

module.exports = { onUseWithGameObject };
