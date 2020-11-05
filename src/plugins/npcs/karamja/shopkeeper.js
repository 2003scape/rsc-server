const SHOPKEEPER_IDS = new Set([168, 169]);

async function onTalkToNPC(player, npc) {
    if (!SHOPKEEPER_IDS.has(npc.id)) {
        return false;
    }

    player.engage(npc);

    await npc.say('Can I help you at all?');

    const choice = await player.ask([
        'Yes please. What are you selling?',
        'No thanks'
    ], true);

    player.disengage();

    if (choice === 0) {
        player.openShop('karamja-general');
    }

    return true;
}

module.exports = { onTalkToNPC };
