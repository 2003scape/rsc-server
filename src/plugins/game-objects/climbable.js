const EXCLUDE_IDS = new Set([130, 198]);

async function onGameObjectCommandOne(player, gameObject) {
    if (EXCLUDE_IDS.has(gameObject.id)) {
        return false;
    }

    //const { world } = player;

    if (/go up|climb(-| )up/i.test(gameObject.definition.commands[0])) {
        //await world.sleepTicks(1);
        player.climb(gameObject, true);
        return true;
    } else if (
        /go down|climb(-| )down/i.test(gameObject.definition.commands[0])
    ) {
        //await world.sleepTicks(1);
        player.climb(gameObject, false);
        return true;
    }

    return false;
}

module.exports = { onGameObjectCommandOne };
