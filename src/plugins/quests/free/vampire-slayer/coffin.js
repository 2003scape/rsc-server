const NPC = require('../../../../model/npc');

const CLOSED_COFFIN_ID = 135;
const COUNT_DRAYNOR_ID = 96;
const OPEN_COFFIN_ID = 136;

async function wakeUpVampire(player) {
    const { world } = player;

    const countDraynor = new NPC(world, {
        id: COUNT_DRAYNOR_ID,
        x: 205,
        y: 3382,
        minX: 202,
        maxX: 207,
        minY: 3379,
        maxY: 3385
    });

    world.addEntity('npcs', countDraynor);
    player.message("A vampire jumps out of the coffin");
}

async function onGameObjectCommandOne(player, gameObject) {
    // https://youtu.be/U3_ci_WbF3Q?t=436
    // count draynor jumps out of the coffin when you open OR search it

    const { world } = player;
    const questStage = player.questStages.vampireSlayer;

    if (gameObject.id === OPEN_COFFIN_ID) {
        if (questStage === -1) {
            player.message("There's a pillow in here");
        } else {
            await wakeUpVampire(player);
        }

        return true;
    } else if (gameObject.id === CLOSED_COFFIN_ID) {
        player.message('You open the coffin');
        world.replaceEntity('gameObjects', gameObject, OPEN_COFFIN_ID);

        if (questStage !== -1) {
            await wakeUpVampire(player);
        }

        return true;
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== OPEN_COFFIN_ID) {
        return false;
    }

    const { world } = player;

    player.message('You close the coffin');
    world.replaceEntity('gameObjects', gameObject, CLOSED_COFFIN_ID);

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
