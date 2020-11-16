// https://classic.runescape.wiki/w/Transcript:Brian

const BRIAN_ID = 131;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BRIAN_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('ello');

    const choice = await player.ask(
        ['So are you selling something?', 'ello'],
        false
    );

    switch (choice) {
        case 0: // selling
            await player.say('So are you selling something?');
            await npc.say('Yep take a look at these great axes');
            player.disengage();
            player.openShop('brians-battleaxe-bazaar');
            return true;
        case 1: // ello
            await player.say('Ello');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
