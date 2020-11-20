const EXCLUDE_IDS = new Set([198]);

async function onGameObjectCommandOne(player, gameObject) {
    const { world } = player;

    if (EXCLUDE_IDS.has(gameObject.id)) {
        return false;
    }

    if (/go up|climb(-| )up/i.test(gameObject.definition.commands[0])) {
        await world.sleepTicks(1);
        player.climb(gameObject, true);
        return true;
    } else if (
        /go down|climb(-| )down/i.test(gameObject.definition.commands[0])
    ) {
        await world.sleepTicks(1);
        player.climb(gameObject, false);
        return true;
    }

    return false;
}

module.exports = { onGameObjectCommandOne };
