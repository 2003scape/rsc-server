// https://classic.runescape.wiki/w/Woodcutting

const items = require('@2003scape/rsc-data/config/items');
const { axes, trees } = require('@2003scape/rsc-data/skills/woodcutting');
const { rollSkillSuccess } = require('../../rolls');

const NORMAL_TREES = new Set([0, 1, 70]);
const TREE_IDS = new Set(Object.keys(trees).map(Number));

// in order of best to worst
// > Unlike RuneScape 2, there is no woodcutting level requirement to use each
// > axe for woodcutting
// this is unlike pickaxes, which do require mining levels to use
const AXE_IDS = Object.keys(axes)
    .map(Number)
    .sort((a, b) => {
        if (axes[a] === axes[b]) {
            return 0;
        }

        return axes[a] > axes[b] ? -1 : 1;
    });

function getDefinition(id) {
    const tree = trees[id];

    if (typeof tree.reference !== 'undefined') {
        return getDefinition(tree.reference);
    }

    return tree;
}

async function onGameObjectCommand(player, gameObject) {
    const treeID = gameObject.id;

    if (!TREE_IDS.has(treeID)) {
        return false;
    }

    const tree = getDefinition(treeID);
    const woodcuttingLevel = player.skills.woodcutting.current;

    if (tree.level > woodcuttingLevel) {
        player.message(
            `You need a woodcutting level of ${tree.level} to axe this tree`
        );

        return true;
    }

    let bestAxeID = -1;

    for (const axeID of AXE_IDS) {
        if (player.inventory.has(axeID)) {
            bestAxeID = axeID;
            break;
        }
    }

    if (bestAxeID === -1) {
        player.message('@que@You need an axe to chop this tree down');
        return true;
    }

    if (player.isTired()) {
        player.message('@que@You are too tired to cut the tree');
        return true;
    }

    const { world } = player;
    const { x, y } = gameObject;
    const axeName = items[bestAxeID].name.toLowerCase();

    player.message(`@que@You swing your ${axeName} at the tree...`);
    player.sendBubble(bestAxeID);

    await world.sleepTicks(3);

    const logSuccess = rollSkillSuccess(
        tree.roll[0] * axes[bestAxeID],
        tree.roll[1] * axes[bestAxeID],
        woodcuttingLevel
    );

    if (world.gameObjects.getAtPoint(x, y)[0] === gameObject && logSuccess) {
        const shouldFall = NORMAL_TREES.has(treeID) || Math.random() <= 0.125;

        if (shouldFall) {
            const stump = world.replaceEntity(
                'gameObjects',
                gameObject,
                tree.stump
            );

            world.setTimeout(() => {
                world.replaceEntity('gameObjects', stump, treeID);
            }, tree.respawn);
        }

        player.addExperience('woodcutting', tree.experience);
        player.message('@que@You get some wood');
        player.inventory.add(tree.log);
    } else {
        player.message('@que@You slip and fail to hit the tree');
    }

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (!/chop/i.test(gameObject.definition.commands[0])) {
        return false;
    }

    await onGameObjectCommand(player, gameObject);
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (!/chop/i.test(gameObject.definition.commands[1])) {
        return false;
    }

    await onGameObjectCommand(player, gameObject);
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
