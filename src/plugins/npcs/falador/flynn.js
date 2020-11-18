// https://classic.runescape.wiki/w/Transcript:Flynn

const FLYNN_ID = 115;

async function onTalkToNPC(player, npc) {
    if (npc.id !== FLYNN_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hello do you want to buy or sell any maces?');

    const choice = await player.ask(
        ['No thanks', "Well I'll have a look anyway"],
        false
    );

    switch (choice) {
        case 0: // no
            await player.say('no thanks');
            break;
        case 1: // yes
            await player.say("Well I'll have a look anyway");
            player.disengage();
            player.openShop('flynns-mace');
            return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
