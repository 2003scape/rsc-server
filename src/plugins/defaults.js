function noop(player) {
    player.message('Nothing interesting happens');
}

async function onLogin() {}

async function onTeleport() {}

async function onCommand() {}

async function onSpellCast() {}

async function onTalkToNPC(player, npc) {
    player.message(
        `The ${npc.definition.name} doesn't seem interested in talking`
    );
}

async function onKilledNPC(player, npc) {
    const { world } = player;
    const drops = npc.rollDrops();

    for (const item of drops) {
        world.dropItem(item, player);
    }
}

async function onNPCCommand(player) {
    noop(player);
}

async function onUseItemOnGameObject(player) {
    noop(player);
}

async function onUseItemOnItem(player) {
    noop(player);
}

async function onItemCommand(player) {
    noop(player);
}

async function onGameObjectCommand(player) {
    noop(player);
}

module.exports = {
    onLogin,
    onTeleport,
    onCommand,
    onSpellCast,
    onKilledNPC,
    onTalkToNPC,
    onNPCCommand,
    onUseItemOnGameObject,
    onUseItemOnItem,
    onItemCommand,
    onGameObjectCommand
};
