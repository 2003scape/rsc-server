// https://classic.runescape.wiki/w/Wine

const { rollSkillSuccess } = require('../../../rolls');

const BAD_WINE_ID = 180;
const GRAPES_ID = 143;
const JUG_OF_WATER_ID = 141;
const WINE_ID = 142;

// same level (35) as pizza, osrs wiki also says that wine stops failing at
// level 68, the same level pizza stops burning as well. using the same rolls
const ROLL = [48, 352];

async function onUseWithInventory(player, item, target) {
    if (
        (item.id !== GRAPES_ID || target.id !== JUG_OF_WATER_ID) &&
        (item.id !== JUG_OF_WATER_ID || target.id !== GRAPES_ID)
    ) {
        return false;
    }

    const cookingLevel = player.skills.cooking.current;

    if (cookingLevel < 35) {
        player.message('You need level 35 cooking to do this');
        return true;
    }

    const { world } = player;

    player.inventory.remove(JUG_OF_WATER_ID);
    player.inventory.remove(GRAPES_ID);
    player.message('@que@You squeeze the grapes into the jug');

    await world.sleepTicks(6);

    const fermentSuccess = rollSkillSuccess(ROLL[0], ROLL[1], cookingLevel);

    if (fermentSuccess) {
        player.inventory.add(WINE_ID);
        player.addExperience('cooking', 440);
        player.message('@que@You make some nice wine');
    } else {
        player.inventory.add(BAD_WINE_ID);
        player.message('@que@You accidentally make some bad wine');
    }

    return true;
}

module.exports = { onUseWithInventory };
