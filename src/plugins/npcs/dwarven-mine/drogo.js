// https://classic.runescape.wiki/w/Transcript:Drogo

const DROGO_ID = 113;

async function onTalkToNPC(player, npc) {
    if (npc.id !== DROGO_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Ello');

    const choice = await player.ask(
        [
            'Do you want to trade?',
            'Hello shorty',
            "Why don't you ever restock ores and bars?"
        ],
        false
    );

    switch (choice) {
        case 0: // yes
            await player.say('Do you want to trade?');
            await npc.say('Yeah sure, I run a mining store.');
            player.disengage();
            player.openShop('drogos-mining-emporium');
            return true;
        case 1: // shorty
            await player.say('Hello Shorty.');
            await npc.say("I may be short, but at least I've got manners");
            break;
        case 2: // restock?
            await player.say("Why don't you ever restock ores and bars?");
            await npc.say('The only ores and bars I sell are those sold to me');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
