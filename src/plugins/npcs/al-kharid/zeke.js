// https://classic.runescape.wiki/w/Transcript:Zeke

const ZEKE_ID = 84;

async function onTalkToNPC(player, npc) {
    if (npc.id !== ZEKE_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('A thousand greetings sir');

    const choice = await player.ask(
        ['Do you want to trade?', 'Nice cloak'],
        true
    );

    switch (choice) {
        case 0: // trade
            await npc.say('Yes certainly', 'I deal in scimitars');
            player.disengage();
            player.openShop('zekes-superior-scimitars');
            return true;
        case 1: // cloak
            await npc.say('Thank you');
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
