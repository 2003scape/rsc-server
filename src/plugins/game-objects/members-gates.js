const GATE_IDS = new Set([
    // taverly
    137,

    // falador
    138,

    // brimhaven
    254,

    // edgeville dungeon
    305,

    // wilderness
    347,

    // digsite
    1089
]);

async function onGameObjectCommandOne(player, gameObject) {
    if (!GATE_IDS.has(gameObject.id)) {
        return false;
    }

    const { world } = player;

    if (!world.members) {
        player.message(gameObject.definition.description);
        return true;
    }

    await player.enterGate(gameObject);
    player.message('you go through the gate');

    return true;
}

module.exports = { onGameObjectCommandOne };
