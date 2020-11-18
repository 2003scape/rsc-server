// https://classic.runescape.wiki/w/Transcript:Osman

const OSMAN_ID = 120;

async function findSomeThings(player, npc) {
    await player.say('Okay, I better go find some things');

    await npc.say(
        'May good luck travel with you',
        "Don't forget to find Leela. It can't be done without her help"
    );

    player.questStages.princeAliRescue = 2;
}

async function firstThing(player, npc) {
    await player.say('What is the first thing I must do?');

    await npc.say(
        'The prince is guarded by some stupid guards, and a clever woman',
        'The woman is our only way to get the prince out',
        'Only she can walk freely about the area',
        'I think you will need to tie her up',
        'one coil of rope should do for that',
        'And then disguise the prince as her to get him out without suspicion'
    );

    await player.say('How good must the disguise must be?');

    await npc.say(
        'Only good enough to fool the guards at a distance',
        'Get a skirt like hers. Same colour, same style',
        'We will only have a short time',
        'A blonde wig too. That is up to you to make or find',
        'Something to colour the skin of the prince',
        'My daughter and top spy, leela, can help you there'
    );

    const choice = await player.ask(
        [
            'Explain the first thing again',
            'What is needed second?',
            'And the final thing you need?',
            'Okay, I better go find some things '
        ],
        false
    );

    switch (choice) {
        case 0: // first thing
            await firstThing(player, npc);
            break;
        case 1: // second thing
            await secondThing(player, npc);
            break;
        case 2: // final thing
            await finalThing(player, npc);
            break;
        case 3: // find things
            await findSomeThings(player.npc);
            break;
    }
}

async function secondThing(player, npc) {
    await player.say('What is needed second?');

    await npc.say(
        'We need the key, or a copy made',
        'If you can get some soft clay, then you can copy the key',
        'If you can convince Lady Keli to show it to you for a moment',
        'She is very boastful. It should not be too hard',
        'Bring the imprint to me, with a bar of bronze.'
    );

    const choice = await player.ask(
        [
            'What is the first thing I must do?',
            'What exactly is needed second?',
            'And the final thing you need?',
            'Okay, I better go find some things'
        ],
        false
    );

    switch (choice) {
        case 0: // first thing
            await firstThing(player, npc);
            break;
        case 1: // second thing
            await secondThing(player, npc);
            break;
        case 2: // final thing
            await finalThing(player, npc);
            break;
        case 3: // find things
            await findSomeThings(player, npc);
            break;
    }
}

async function finalThing(player, npc) {
    await player.say('And the final things you need?');

    await npc.say(
        'You will need to stop the guard at the door',
        'Find out if he has any weaknesses, and use them'
    );

    const choice = await player.ask(
        [
            'What is the first thing I must do?',
            'What exactly is needed second?',
            'Okay, I better go find some things'
        ],
        false
    );

    switch (choice) {
        case 0: // first thing
            await firstThing(player, npc);
            break;
        case 1: // second thing
            await secondThing(player, npc);
            break;
        case 2:
            await findSomeThings(player, npc);
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== OSMAN_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    player.engage(npc);

    if (!questStage) {
        await npc.say('Hello, I am Osman', 'What can I assist you with');

        const choice = await player.ask(
            [
                "You don't seem very tough. Who are you?",
                'I hear wild rumours about a Prince',
                'I am just being nosy.'
            ],
            true
        );

        switch (choice) {
            case 0: // who are you
                await npc.say(
                    'I am in the employ of the Emir',
                    'That is all you need to know'
                );
                break;
            case 1: // wild rumours
                await npc.say(
                    'The prince is not here. He is... away',
                    'If you can be trusted, speak to the chancellor, Hassan'
                );
                break;
            case 2: // nosy
                await npc.say(
                    'That bothers me not',
                    'The secrets of Al Kharid protect themselves'
                );
                break;
        }
    } else if (questStage === 1) {
        await player.say(
            'The chancellor trusts me. I have come for instructions'
        );

        await npc.say(
            'Our Prince is captive by the Lady Keli',
            'We just need to make the rescue',
            'There are three things we need you to do'
        );

        const choice = await player.ask(
            [
                'What is the first thing I must do?',
                'What is needed second?',
                'And the final things you need?'
            ],
            false
        );

        switch (choice) {
            case 0: // first thing
                await firstThing(player, npc);
                break;
            case 1: // second thing
                await secondThing(player, npc);
                break;
            case 2: // final thing
                await finalThing(player, npc);
                break;
        }
    } else if (questStage === -1) {
        await npc.say(
            'Well done. A great rescue',
            'I will remember you if I have anything dangerous to do'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
