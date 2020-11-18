// https://classic.runescape.wiki/w/Fishing

const items = require('@2003scape/rsc-data/config/items');
const { rollCascadedSkillSuccess } = require('../../rolls');
const { spots } = require('@2003scape/rsc-data/skills/fishing');

const BIG_NET_ID = 548;
const FEATHER_ID = 381;

function getSpot(id, command) {
    let spot = spots[id];

    if (!spot) {
        return false;
    }

    if (spot.reference) {
        return getSpot(spot.reference, command);
    }

    return spot[command];
}

async function doFishing(player, gameObject, index) {
    const command = gameObject.definition.commands[index].toLowerCase();
    const spot = getSpot(gameObject.id, command);

    if (!spot) {
        return false;
    }

    if (player.isTired()) {
        player.message('You are too tired to catch this fish');
        return true;
    }

    const fishingLevel = player.skills.fishing.current;
    const { tool, bait, fish } = spot;

    let catchable = [];
    let minimumLevel = 99;

    for (const [fishID, { level, experience }] of Object.entries(fish)) {
        if (level < minimumLevel) {
            minimumLevel = level;
        }

        if (fishingLevel >= level) {
            catchable.push({ id: +fishID, level, experience });
        }
    }

    if (!catchable.length) {
        const action =
            command === 'cage' ? 'catch lobsters' : `${command} these fish`;

        player.message(
            `@que@You need at least level ${minimumLevel} fishing to ${action}`
        );

        return true;
    }

    if (!player.inventory.has(tool)) {
        let action;

        if (command === 'cage') {
            action = 'cage lobsters';
        } else if (/^(lure|bait)$/.test(command)) {
            action = `${command} these fish`;
        } else {
            action = 'catch these fish';
        }

        player.message(
            `@que@You need a ${items[tool].name.toLowerCase()} to ${action}`
        );

        return true;
    }

    if (typeof bait === 'number' && !player.inventory.has(bait)) {
        const baitName =
            bait === FEATHER_ID ? 'feathers' : items[bait].name.toLowerCase();

        player.message(`@que@You don't have any ${baitName} left`);
        return true;
    }

    const { world } = player;

    catchable = catchable.sort((a, b) => {
        if (a.level === b.level) {
            return 0;
        }

        return a.level > b.level ? -1 : 1;
    });

    player.sendSound('fish');
    player.sendBubble(tool);

    if (typeof bait === 'number') {
        player.inventory.remove(bait);
    }

    let catching;

    if (command === 'net') {
        catching = 'some fish';
    } else if (command === 'cage') {
        catching = 'a lobster';
    } else {
        catching = 'a fish';
    }

    player.message(`@que@You attempt to catch ${catching}`);

    await world.sleepTicks(3);

    if (tool !== BIG_NET_ID) {
        const rolls = catchable.map(({ id }) => fish[id].roll);
        const caughtIndex = rollCascadedSkillSuccess(rolls, fishingLevel);

        if (caughtIndex > -1) {
            const { id, experience } = catchable[caughtIndex];
            player.addExperience('fishing', experience);
            player.inventory.add(id);

            const fishName =
                (command === 'net' ? 'some ' : 'a ') +
                items[id].name.toLowerCase().replace('raw ', '');

            player.message(`@que@You catch ${fishName}`);
        } else {
            player.message(`@que@You fail to catch anything`);
        }
    } else {
        // TODO handle big net later
    }

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    return await doFishing(player, gameObject, 0);
}

async function onGameObjectCommandTwo(player, gameObject) {
    return await doFishing(player, gameObject, 1);
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
