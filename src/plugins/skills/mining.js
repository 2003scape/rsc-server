const { rocks } = require('@2003scape/rsc-data/skills/mining');

const ROCK_IDS = new Set(Object.keys(rocks).map(Number));

async function onGameObjectCommand(player, gameObject, command) {
    if (
        command !== 'mine' ||
        command !== 'prospect' ||
        !ROCK_IDS.has(gameObject.id)
    ) {
        return false;
    }

    return true;
}
