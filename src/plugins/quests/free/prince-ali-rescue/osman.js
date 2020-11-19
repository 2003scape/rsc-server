// https://classic.runescape.wiki/w/Transcript:Osman
// https://github.com/hikilaka/rscemulation/blob/master/server/src/org/rscemulation/server/npchandler/Prince_Ali_Rescue/Osman.java

const BLONDE_WIG_ID = 244;
const BRONZE_BAR_ID = 169;
const BRONZE_KEY_ID = 242;
const KEYPRINT_ID = 247;
const OSMAN_ID = 120;
const PASTE_ID = 240;
const ROPE_ID = 237;
const SKIRT_ID = 194;

async function findSomeThings(player, npc) {
    await npc.say(
        'May good luck travel with you',
        "Don't forget to find Leela. It can't be done without her help"
    );

    player.questStages.princeAliRescue = 2;
}

async function firstThing(player, npc) {
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
        true
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
        true
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
        true
    );

    switch (choice) {
        case 0: // first thing
            await firstThing(player, npc);
            break;
        case 1: // second thing
            await secondThing(player, npc);
            break;
        case 2: // find things
            await findSomeThings(player, npc);
            break;
    }
}

async function stillNeedToGet(player, npc) {
    await player.say('Can you tell me what I still need to get?');
    await npc.say('Let me check. You need:');

    if (player.inventory.has(BRONZE_KEY_ID)) {
        // don't think this was actually ever in the game. in my videos Osman
        // assumes you lost the key if you talk to him again after picking it up
        // from Leela, even if you have it in your inventory.
        await npc.say('You have the key, good');
    } else {
        await npc.say(
            'A print of the key in soft clay, and a bronze bar',
            'Then collect the key from Leela'
        );
    }

    if (player.inventory.has(BLONDE_WIG_ID)) {
        await npc.say('The wig you have got, well done');
    } else {
        await npc.say('You need to make a Blonde Wig somehow. Leela may help');
    }

    if (player.inventory.has(SKIRT_ID)) {
        await npc.say('You have the skirt, good');
    } else {
        await npc.say("A skirt the same as Keli's,");
    }

    if (player.inventory.has(PASTE_ID)) {
        await npc.say(
            'You have the skin paint, well done',
            'I thought you would struggle to make that'
        );
    } else {
        await npc.say('Something to colour the Princes skin lighter');
    }

    if (player.inventory.has(ROPE_ID)) {
        await npc.say('Yes, you have the rope.');
    } else {
        await npc.say('Rope to tie Keli up with');
    }

    await npc.say(
        'You still need some way to stop the guard from interfering',
        'Once you have everything, Go to Leela',
        'she must be ready to get the prince away'
    );
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
            true
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
    } else if (questStage === 2 || questStage === 3) {
        const hasBar = player.inventory.has(BRONZE_BAR_ID);
        const hasKeyprint = player.inventory.has(KEYPRINT_ID);
        const keyMade = !!player.cache.bronzeKeyMade;
        const keyReceived = !!player.cache.bronzeKeyReceived;

        if (!keyMade && keyReceived && !hasKeyprint) {
            // https://www.youtube.com/watch?v=udiPTbxaYB0
            // it doesn't even matter if the key is in their inventory, osman
            // assumes you lost it
            await npc.say(
                'You have lost the key for the Princes cell',
                'Get me the imprint and some more bronze, and I can get ' +
                    'another made'
            );

            await player.say('I will go get they key imprint again');
        } else if (!keyMade && hasKeyprint && hasBar) {
            if (keyReceived) {
                await npc.say('Well done, we can remake the key now.');
            } else {
                await npc.say('Well done, we can make the key now.');
            }

            player.inventory.remove(KEYPRINT_ID);
            player.inventory.remove(BRONZE_BAR_ID);
            player.cache.bronzeKeyMade = true;
            player.message('Osman takes the Key imprint and the bronze bar');

            await npc.say('Pick the key up from Leela.');

            if (!player.cache.bronzeKeyPaid) {
                await npc.say(
                    'I will let you get 80 coins from the chancellor for ' +
                        'getting this key'
                );
            }
        } else if (!keyMade && hasKeyprint && !hasBar) {
            await npc.say(
                'Good, you have the print of the key',
                'Get a bar of Bronze too, and I can get the key made'
            );

            const choice = await player.ask(
                [
                    'I will get one, and come back',
                    'Can you tell me what I still need to get?'
                ],
                false
            );

            switch (choice) {
                case 0: // get one and come back
                    await player.say('I will get one, and come back');
                    break;
                case 1: // still need to get
                    await stillNeedToGet(player, npc);
                    break;
            }
        } else {
            await stillNeedToGet(player, npc);
        }
    } else if (questStage === 4) {
        await npc.say(
            'The prince is safe, and on his way home with Leela',
            'You can pick up your payment from the chancellor'
        );
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
