// https://classic.runescape.wiki/w/Shopkeeper_(Varrock)

const SHOPKEEPER_IDS = new Set([51, 82]);

async function onTalkToNPC(player, npc) {
    if (!SHOPKEEPER_IDS.has(npc.id)) {
        return false;
    }

    player.engage(npc);

    await npc.say('Can I help you at all?');

    const choice = await player.ask(
        ['Yes please. What are you selling?', 'No thanks'],
        true
    );

    if (choice === 0) {
        await npc.say('Take a look');
        player.disengage();
        player.openShop('varrock-general');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
