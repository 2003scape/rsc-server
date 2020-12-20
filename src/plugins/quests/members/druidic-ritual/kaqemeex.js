const KAQEMEEX_ID = 204;

async function initiateQuest(player, kaqemeex) {
    await player.say('Ok I will try and help'); // no comma

    await kaqemeex.say(
        'Ok go and speak to our Elder druid, Sanfew',
        'He lives in our village to the south of here',
        'He knows better what we need than I'
    );

    player.questStages.druidicRitual = 1;
}

async function inSearchOfQuest(player, kaqemeex) {
    await kaqemeex.say(
        'I think I may have a worthwhile quest for you actually',
        "I don't know if you are familair withe the stone circle south" +
            'of Varrock' // sic
    );
    await stoneCircleDialogue(player, kaqemeex);
}

async function stoneCircleDialogue(player, kaqemeex) {
    await kaqemeex.say(
        'That used to be our stone circle',
        'Unfortunatley  many years ago dark wizards cast a wicked' + // sic
            ' spell on it',
        'Corrupting it for their own evil purposes',
        'and making it useless for us',
        'We need someone who will go on a quest for us',
        'to help us purify the circle of Varrock'
    );

    const choice = await player.ask(
        [
            'Ok, I will try and help',
            "No that doesn't sound very interesting",
            'So is there anything in this for me?'
        ],
        false
    );

    switch (choice) {
        case 0: // i will try and help
            await initiateQuest(player, kaqemeex);
            break;
        case 1: // no
            await player.say("No that doesn't sound very interesting");
            await kaqemeex.say(
                "Well suit yourself, we'll have to find someone else"
            );

            break;
        case 2: // is there anything in this for me?
            await player.say('So is there anything in this for me?');

            await kaqemeex.say(
                'We are skilled in the art of herblaw',
                'We can teach you some of our skill if you complete your quest'
            );

            const choice = await player.ask(
                [
                    'Ok, I will try and help',
                    "No that doesn't sound very interesting"
                ],
                false
            );

            if (choice === 0) {
                // i will try and help
                await initiateQuest(player, kaqemeex);
            } else if (choice === 1) {
                // no
                await player.say("No that doesn't sound very interesting");
                await kaqemeex.say(
                    "Well suit yourself, we'll have to find someone else"
                );
            }

            break;
    }
}
async function preQuest(player, kaqemeex) {
    await kaqemeex.say('What brings you to our holy Monument');

    const choice = await player.ask(
        ['Who are you?', "I'm in search of a quest", 'Did you build this?'],
        true
    );

    switch (choice) {
        case 0: // who are you?
            await kaqemeex.say(
                'We are the druids of Guthix',
                'We worship our God at our famous stone circles'
            );

            const choice = await player.ask(
                [
                    'What about the stone circle full of dark wizards?',
                    'So whats so good about Guthix',
                    "Well I'll be on my way now"
                ],
                false
            );

            if (choice === 0) {
                // stone circle full of dark wizards?
                await player.say(
                    'What about the stone circle full of dark wizards?'
                );

                await stoneCircleDialogue(player, kaqemeex);
            } else if (choice === 1) {
                // what's so good about guthix?
                await player.say("So what's so good abou Guthix?"); // sic
                await kaqemeex.say(
                    'Guthix is very important to this world',
                    'He is the God of nature and balance',
                    'He is in the trees and he is in the rock'
                );
            } else if (choice === 2) {
                // bye
                await player.say("Well I'll be on my way now");
                await kaqemeex.say('good bye');
            }

            break;
        case 1: // in search of a quest
            await inSearchOfQuest(player, kaqemeex);
            break;
        case 2: // did you build this?
            await kaqemeex.say(
                "Well I didn't build it personally",
                'Our forebearers did',
                'The first druids of Guthix built many stone circles 800 years ago',
                'Only 2 that we know of remain',
                'And this is the only 1 we can use any more'
            );

            const secondChoice = await player.ask(
                [
                    'What about the stone circle full of dark wizards?',
                    "I'm in search of a quest",
                    "Well I'll be on my way now"
                ],
                true
            );

            if (secondChoice === 0) {
                // stone circle full of dark wizards?
                await stoneCircleDialogue(player, kaqemeex);
            } else if (secondChoice === 1) {
                // in search of a quest
                await inSearchOfQuest(player, kaqemeex);
            } else if (secondChoice === 2) {
                // bye
                await kaqemeex.say('good bye');
            }

            break;
    }
}

async function helpingSanfewStages(player, kaqemeex) {
    await player.say('Hello again');
    await kaqemeex.say(
        'You need to speak to Sanfew in the village south of here',
        'To continue with your quest'
    );
}

async function finalizeQuest(player, kaqemeex) {
    await kaqemeex.say(
        "I've heard you were very helpful to Sanfew",
        'I will teach you the herblaw you need to know now'
    );

    player.message(
        '@gre@Well done you have completed the druidic ritual quest'
    );
    player.questStages.druidicRitual = -1;
    player.addQuestPoints(4);
    player.message('@gre@You haved gained 4 quest points!');

    player.addExperience('herblaw', 1000, false);
}

async function postQuest(player, kaqemeex) {
    await kaqemeex.say('Hello how is the herblaw going?');

    const choice = await player.ask(
        ['Very well thankyou', 'I need more practice at it'],
        true
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== KAQEMEEX_ID) {
        return false;
    }

    const questStage = player.questStages.druidicRitual;

    player.engage(npc);

    if (!questStage) {
        await preQuest(player, npc);
    } else if (questStage === 1 || questStage === 2) {
        await helpingSanfewStages(player, npc);
    } else if (questStage === 3) {
        await finalizeQuest(player, npc);
    } else {
        await postQuest(player, npc);
    }

    player.disengage(npc);
    return true;
}

module.exports = { onTalkToNPC };
