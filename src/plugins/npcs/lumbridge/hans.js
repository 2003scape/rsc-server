// https://classic.runescape.wiki/w/Transcript:Hans

const HANS_ID = 5;

async function onTalkToNPC(player, npc) {
    if (npc.id !== HANS_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hello what are you doing here?');

    const choice = await player.ask(
        [
            "I'm looking for whoever is in charge of this place",
            'I have come to kill everyone in this castle',
            "I don't know. I'm lost. Where am i?"
        ],
        true
    );

    switch (choice) {
        case 0:
            await npc.say("Sorry, I don't know where he is right now");
            break;
        case 1:
            await npc.say('HELP HELP!');
            break;
        case 2:
            await npc.say('You are in Lumbridge Castle');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
