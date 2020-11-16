async function initiateQuest(player, npc) {
    await player.say('Not very busy in here today is it');

    await npc.say(
        'No it was earlier',
        'There was a guy in here saying the goblins up by the mountain are ' +
            'arguing again',
        'Of all things about the colour of their armour.',
        'Knowing the goblins, it could easily turn into a full blown war',
        "Which wouldn't be good",
        'Goblin wars make such a mess of the countryside'
    );

    await player.say(
        "Well if I have time I'll see if I can go and knock some sense into " +
            'them'
    );

    player.questStages.goblinDiplomacy = 1;
}

module.exports = { initiateQuest };
