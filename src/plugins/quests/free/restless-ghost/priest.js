// https://classic.runescape.wiki/w/Transcript:Priest

const PRIEST_ID = 9;

async function slimeAndTenticles(player, npc) {
    const choice = await player.ask(
        [
            "You don't understand. This a computer game",
            'I am - do you like my disguise?'
        ],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('I beg your pardon?');
            await player.say('Never mind');
            break;
        case 1:
            await npc.say('Aargh begone foul creature from another dimension');
            await player.say('Ok, Ok, It was a joke');
            break;
    }
}

async function priestWorld(player, npc) {
    const choice = await player.ask(
        ['Oh that Saradomin', "Oh sorry I'm not from this world"],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('There is only one Saradomin');
            break;
        case 1:
            await npc.say(
                "That's strange",
                'I thought things not from this world were all slime and ' +
                    'tenticles'
            );

            await slimeAndTenticles(player, npc);
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== PRIEST_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Welcome to the church of holy Saradomin');

    const choice = await player.ask(
        [
            "Who's Saradomin?",
            "Nice place you've got here",
            "I'm looking for a quest"
        ],
        true
    );

    switch (choice) {
        case 0:
            await npc.say(
                'Surely you have heard of the God, Saradomin?',
                'He who creates the forces of goodness and purity in this' +
                    ' world?',
                'I cannot believe your ignorance!',
                'This is the God with more followers than any other!',
                'At least in these parts!',
                'He who along with his brother Guthix and Zamorak created' +
                    ' this world'
            );

            await priestWorld(player, npc);
            break;
        case 1:
            await npc.say("It is, isn't it?", 'It was built 230 years ago');
            break;
        case 2:
            player.message('The Restless Ghost is coming soon');
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
