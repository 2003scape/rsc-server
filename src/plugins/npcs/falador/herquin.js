// https://classic.runescape.wiki/w/Transcript:Herquin

const HERQUIN_ID = 155;

async function onTalkToNPC(player, npc) {
    if (npc.id !== HERQUIN_ID) {
        return false;
    }

    player.engage(npc);

    const choice = await player.ask(
        ['Do you wish to trade?', "Sorry i don't want to talk to you actually"],
        false
    );

    switch (choice) {
        case 0:
            await player.say('Do you wish to trade?');
            await npc.say('Why yes this a jewel shop after all');
            player.disengage();
            player.openShop('herquins-gems');
            return true;
        case 1:
            await player.say("Sorry I don't want to talk to you actually");
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
