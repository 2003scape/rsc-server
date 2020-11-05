const BOB_ID = 1;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BOB_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hello. How can I help you?');

    const choice = await player.ask(
        ['Give me a quest!', 'Have you anything to sell?'],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('Get yer own!');
            player.disengage();
            break;
        case 1:
            await npc.say('Yes, I buy and sell axes, take you pick! (or axe)');
            player.disengage();
            player.openShop('bobs-axes');
            break;
    }

    return true;
}

module.exports = { onTalkToNPC };
