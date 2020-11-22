// https://classic.runescape.wiki/w/Transcript:Morgan

const MORGAN_ID = 97;

async function initiateQuest(player, npc) {
    await npc.say(
        'I think first you should seek help',
        'I have a friend who is a retired vampire hunter',
        'Called Dr Harlow',
        'He may be able to give you some tips',
        'He can normally be found in the Jolly boar inn these days',
        "He's a bit of an old soak",
        'Mention his old friend Morgan',
        "I'm sure he wouldn't want his old friend to be killed by a vampire"
    );

    await player.say("I'll look him up then");

    player.questStages.vampireSlayer = 1;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== MORGAN_ID) {
        return false;
    }

    const questStage = player.questStages.vampireSlayer;

    player.engage(npc);

    if (!questStage) {
        await npc.say('Please please help us, bold hero');
        await player.say("What's the problem?");

        await npc.say(
            'Our little village has been dreadfully ravaged by an evil vampire',
            "There's hardly any of us left",
            'We need someone to get rid of him once and for good'
        );

        const choice = await player.ask(
            [
                'No. vampires are scary',
                "Ok I'm up for an adventure",
                "I tried fighting him. He wouldn't die"
            ],
            true
        );

        switch (choice) {
            case 0: // scary
                await npc.say("I don't blame you");
                break;
            case 1: // adventure
                await initiateQuest(player, npc);
                break;
            case 2: // wouldn't die
                await npc.say('Maybe you are not going about it right');
                await initiateQuest(player, npc);
                break;
        }
    } else {
        await npc.say('How are you doing with your quest?');

        if (questStage === 1) {
            await player.say("I'm working on it still");

            await npc.say(
                'Please hurry',
                'Every day we live in fear of lives',
                'That we will be the vampires next victim'
            );
        } else if (questStage === -1) {
            await player.say('I have slain the foul creature');

            await npc.say(
                'Thank you, thank you',
                'You will always be a hero in our village'
            );
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
