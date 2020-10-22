const { axes, trees } = require('@2003scape/rsc-data/skills/woodcutting');
const { rollSkillingSuccess } = require('../../rolls');

const TREE_IDS = new Set(Object.keys(trees).map(Number));

// in order of best to worst
const AXE_IDS = [405, 204, 203, 428, 88, 12, 87];

async function onGameObjectCommand(player, gameObject, command) {
    if (command !== 'chop' || !TREE_IDS.has(gameObject.id)) {
        return false;
    }

    const tree = trees[gameObject.id];

    let playerAxeID = -1;

    for (const axeID of AXE_IDS) {
        if (player.inventory.has(axeID)) {
            playerAxeID = axeID;
            break;
        }
    }

    if (playerAxeID === -1) {
    }

    const { world } = player;

    return true;
}

module.exports = { onGameObjectCommand };
