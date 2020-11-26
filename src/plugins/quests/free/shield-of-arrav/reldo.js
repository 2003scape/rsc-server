// https://classic.runescape.wiki/w/Transcript:Reldo

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

module.exports = { initiateQuest };
