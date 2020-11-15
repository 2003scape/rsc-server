async function canIHelpYou(player, npc, shop) {
    player.engage(npc);

    await npc.say('Can I help you at all?');

    const choice = await player.ask(
        ['Yes please. What are you selling?', 'No thanks'],
        true
    );

    if (choice === 0) {
        await npc.say('Take a look');
        player.disengage();
        player.openShop(shop);
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { canIHelpYou };
