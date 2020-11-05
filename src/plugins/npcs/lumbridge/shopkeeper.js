const LUMBRIDGE_SHOPKEEPERS = [55, 83];

async function onTalkToNPC(player, npc) {
    if (!LUMBRIDGE_SHOPKEEPERS.includes(npc.id)) {
        return false;
    }

    player.engage(npc);

    await npc.say('Can I help you at all?');

    const choice = await player.ask(
        ['Yes please. What are you selling?', 'No thanks'],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('Take a look');
            player.disengage();
            player.openShop('lumbridge-general');
            break;
        case 1:
            player.disengage();
            break;
    }
    return true;
}

module.exports = { onTalkToNPC };
