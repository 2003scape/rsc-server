// https://classic.runescape.wiki/w/Transcript:Jailguard

const JAILGUARD_ID = 127;

async function onTalkToNPC(player, npc) {
    if (npc.id !== JAILGUARD_ID) {
        return false;
    }

    player.engage(npc);

    await player.say('Hi, who are you guarding here?');
    await npc.say(
        "Can't say, all very secret. you should get out of here",
        'I am not supposed to talk while I guard'
    );

    const choice = await player.ask(
        [
            'Hey, chill out, I wont cause you trouble',
            "I had better leave, I don't want trouble"
        ],
        true
    );

    switch (choice) {
        case 0: // chill out
            await player.say('I was just wondering what you do to relax');

            await npc.say(
                'You never relax with these people, but its a good career ' +
                    'for a young man'
            );
            break;
        case 1: // leave
            await npc.say(
                'Thanks I appreciate that',
                'Talking on duty can be punishable by having your mouth ' +
                    'stitched up',
                'These are tough people, no mistake'
            );
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
