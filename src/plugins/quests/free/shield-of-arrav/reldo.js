// https://classic.runescape.wiki/w/Transcript:Reldo

const RELDO_ID = 20;

async function initiateQuest(player, npc) {
    await npc.say(
        "I don't think there's any here",
        'Let me think actually',
        'If you look in a book',
        'called the shield of Arrav',
        "You'll find a quest in there",
        "I'm not sure where the book is mind you",
        "I'm sure it's somewhere in here"
    );

    await player.say('Thankyou');

    player.questStages.shieldOfArrav = 1;
}

async function onTalkToNPC(player, npc) {
    if (
        npc.id !== RELDO_ID ||
        (player.questStages.shieldOfArrav !== 2 &&
            player.questStages.shieldOfArrav !== 3)
    ) {
        return false;
    }

    player.engage(npc);

    await player.say(
        "OK I've read the book",
        'Do you know where I can find the Phoenix Gang'
    );

    await npc.say(
        "No I don't",
        'I think I know someone who will though',
        'Talk to Baraek, the fur trader in the market place',
        "I've heard he has connections with the Phoenix Gang"
    );

    await player.say("Thanks, I'll try that");

    player.questStages.shieldOfArrav = 3;

    player.disengage();
    return true;
}

module.exports = { initiateQuest, onTalkToNPC };
