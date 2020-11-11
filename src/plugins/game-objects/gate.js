// { openID: closedID }
const OPEN_IDS = {
    59: 60,
    58: 57,
    63: 64
};

const CLOSED_IDS = {};

for (const [openID, closedID] of Object.entries(OPEN_IDS)) {
    CLOSED_IDS[closedID] = openID;
}

function getMessage(gameObject, open) {
    const name = gameObject.definition.name;
    let message = 'The ';

    if (/door/i.test(name)) {
        message += 'door';

        if (/s$/.test(name)) {
            message += open ? 's swing open' : 's creak shut';
        } else {
            message += open ? ' swings open' : ' creaks shut';
        }
    } else {
        message += 'gate ' + (open ? 'swings open' : 'creaks shut');
    }

    return message;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (!CLOSED_IDS.hasOwnProperty(gameObject.id)) {
        return false;
    }

    const { world } = player;

    world.replaceEntity('gameObjects', gameObject, CLOSED_IDS[gameObject.id]);
    player.message(getMessage(gameObject, true));
    player.sendSound('opendoor');

    return true;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (!OPEN_IDS.hasOwnProperty(gameObject.id)) {
        return false;
    }

    const { world } = player;

    player.lock();

    world.replaceEntity('gameObjects', gameObject, OPEN_IDS[gameObject.id]);
    player.message(getMessage(gameObject, false));
    player.sendSound('closedoor');

    await world.sleepTicks(1);
    player.unlock();

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
