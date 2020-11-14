// https://classic.runescape.wiki/w/Firemaking

// https://oldschool.runescape.wiki/w/Fire#cite_note-1
// > Mod Ash: "[How long do fires last roughly (or precisely if you wish to be
// > so kind)?] 60-119 secs randomly."

const GameObject = require('../../model/game-object');
const GroundItem = require('../../model/ground-item');
const { rollSkillSuccess } = require('../../rolls');

const ASHES_ID = 181;
const FIRE_ID = 97;
const LOGS_ID = 14;
const TINDERBOX_ID = 166;

// 25% at level 1, 100% at level 60
const ROLL = [64, 392];

async function onUseWithGroundItem(player, groundItem, item) {
    if (groundItem.id !== LOGS_ID || item.id !== TINDERBOX_ID) {
        return false;
    }

    const { world } = player;
    const { x, y } = groundItem;

    const indoors = !!world.landscape.getTileAtGameCoords(x, y).getTileDef()
        .indoors;

    if (indoors || world.gameObjects.getAtPoint(x, y).length) {
        player.message("@que@You can't light a fire here");
        return true;
    }

    player.sendBubble(TINDERBOX_ID);
    player.message('@que@You attempt to light the logs');
    await world.sleepTicks(2);

    const level = player.skills.firemaking.current;
    const fireSuccess = rollSkillSuccess(ROLL[0], ROLL[1], level);

    if (fireSuccess) {
        player.message('@que@The fire catches and the logs begin to burn');
        world.removeEntity('groundItems', groundItem);

        const fire = new GameObject(world, {
            id: FIRE_ID,
            x,
            y,
            direction: 0
        });

        world.setTimeout(() => {
            world.removeEntity('gameObjects', fire);
            const ashes = new GroundItem(world, { id: ASHES_ID, x, y });
            world.addEntity('groundItems', ashes);
        }, (Math.floor(Math.random() * 60) + 60) * 1000);

        world.addEntity('gameObjects', fire);
        player.addExperience('firemaking', 100 + level * 7);
    } else {
        player.message('@que@You fail to light a fire');
    }

    return true;
}

async function onUseWithInventory(player, item, targetItem) {
    if (
        !(item.id === LOGS_ID && targetItem.id === TINDERBOX_ID) &&
        !(item.id === TINDERBOX_ID && targetItem.id === LOGS_ID)
    ) {
        return false;
    }

    // who's talking to the player??
    player.message(
        '@que@I think you should put the logs down before you light them!'
    );

    return true;
}

module.exports = { onUseWithGroundItem, onUseWithInventory };
