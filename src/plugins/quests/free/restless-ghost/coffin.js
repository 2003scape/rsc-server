const CLOSED_COFFIN_ID = 39;
const GHOST_ID = 15;
const OPEN_COFFIN_ID = 40;
const SKULL_ID = 27;

async function onGameObjectCommandOne(player, gameObject) {
    const { world } = player;

    if (gameObject.id === CLOSED_COFFIN_ID) {
        world.replaceEntity('gameObjects', gameObject, OPEN_COFFIN_ID);
        player.message('You open the coffin');
        return true;
    } else if (gameObject.id === OPEN_COFFIN_ID) {
        const questStage = player.questStages.theRestlessGhost;

        if (questStage === -1) {
            player.message('There is a nice and complete skeleton in here');
        } else if (questStage > 1) {
            player.message("There's a skeleton without a skull in here");
        } else {
            player.message('You search the coffin and find some human remains');
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

    world.replaceEntity('gameObjects', gameObject, CLOSED_COFFIN_ID);
    player.message('You close the coffin');
}

async function onUseWithGameObject(player, gameObject, item) {
    const questStage = player.questStages.theRestlessGhost;

    if (
        gameObject.id !== OPEN_COFFIN_ID ||
        item.id !== SKULL_ID ||
        questStage !== 3
    ) {
        return false;
    }

    const { world } = player;

    player.message("You put the skull in the coffin");
    player.inventory.remove(SKULL_ID);
    await world.sleepTicks(2);
    player.message('The ghost has vanished');

    const ghost = world.npcs.getByID(GHOST_ID);

    if (ghost && !ghost.interlocutor) {
        world.removeEntity('npcs', ghost);
    }

    await world.sleepTicks(2);
    player.message('You hear a faint voice in the air');
    await world.sleepTicks(2);
    player.message('Thank you');
    await world.sleepTicks(2);

    player.message('You have completed the restless ghost quest');

    delete player.cache.takenGhostSkull;
    player.addExperience(
        'prayer',
        player.skills.prayer.base * 62.5 + 500,
        false
    );

    player.questStages.theRestlessGhost = -1;
    player.addQuestPoints(1);
    player.message('@gre@You haved gained 1 quest point');

    return true;
}

module.exports = {
    onGameObjectCommandOne,
    onGameObjectCommandTwo,
    onUseWithGameObject
};
