// https://classic.runescape.wiki/w/Transcript:Reldo

async function knowAboutDwarves(player, npc) {
    await npc.say(
        'The Imcando Dwarves, you say?',
        "They were the world's most skilled smiths about a hundred years ago",
        'They used secret knowledge',
        'Which they passed down from generation to generation',
        'Unfortunatly about a century ago the once thriving',
        'Was wiped out during the barbarian invasions of that time'
    );

    await player.say('So are there any Imcando left at all?');

    await npc.say(
        'A few of them survived',
        'But with the bulk of their population destroyed',
        'Their numbers have dwindled even further',
        'Last I knew there were a couple living in Asgarnia',
        'Near the cliffs on the Asgarnian southern peninsula',
        'They tend to keep to themselves',
        "They don't tend to tell people that they're the descendants of the " +
            'Imcando',
        'Which is why people think that the tribe has died out totally',
        'you may have more luck talking to them if you bring them some red ' +
            'berry pie',
        'They really like red berry pie'
    );

    player.questStages.theKnightsSword = 2;
}

module.exports = { knowAboutDwarves };
