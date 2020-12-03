// https://classic.runescape.wiki/w/Transcript:Ghost_(The_restless_ghost)

const GHOSTSPEAK_AMULET_ID = 24;
const GHOST_ID = 15;
const SKULL_ID = 27;

async function dontSpeakGhost(player, npc) {
    await npc.say('Woo woo?');
    await player.say("Nope still don't understand you");
    await npc.say('Woooooooo');
    await player.say('Never mind');
}

async function goodbyeThanks(npc) {
    await npc.say('Wooo wooo');
}

async function goodbyeNotSure(player, npc) {
    const choice = await player.ask(
        ['Goodbye. Thanks for the chat', "Hmm I'm not sure about that"],
        true
    );

    switch (choice) {
        case 0: // goodbye
            await goodbyeThanks(npc);
            break;
        case 1: // not sure
            await npc.say('Wooo woo');
            await player.say('Well if you insist');
            await npc.say('Wooooooooo');
            await player.say('Ah well, better be off now');
            await npc.say('Woo');
            await player.say('Bye');
            break;
    }
}

async function interesting(player, npc) {
    await npc.say('Woo wooo', 'Woooooooooooooooooo');

    const choice = await player.ask(
        ['Did he really?', "Yeah that's what I thought"],
        true
    );

    switch (choice) {
        // did he
        case 0: {
            await npc.say('Woo');

            const choice = await player.ask(
                [
                    'My brother had exactly the same problem',
                    'Goodbye. Thanks for the chat'
                ],
                true
            );

            switch (choice) {
                // brother
                case 0: {
                    await npc.say('Woo Wooooo', 'Wooooo Woo woo woo');

                    const choice = await player.ask(
                        [
                            'Goodbye. Thanks for the chat',
                            "You'll have to give me the recipe some time"
                        ],
                        true
                    );

                    switch (choice) {
                        case 0: // goodbye
                            await goodbyeThanks(npc);
                            break;
                        case 1: // recipe
                            await npc.say('Wooooooo woo woooooooo');
                            await goodbyeNotSure(player, npc);
                    }

                    break;
                }
                case 1: // goodbye
                    await goodbyeThanks(npc);
                    break;
            }

            break;
        }
        case 1: // yeah
            await npc.say('Wooo woooooooooooooo');
            await goodbyeNotSure(player, npc);
            break;
    }
}

async function noAmulet(player, npc) {
    await player.say('Hello ghost, how are you?');
    await npc.say('Wooo wooo wooooo');

    const choice = await player.ask(
        [
            "Sorry I don't speak ghost",
            "Ooh that's interesting",
            'Any hints where I can find some treasure?'
        ],
        true
    );

    switch (choice) {
        case 0: // dont speak ghost
            await dontSpeakGhost(player, npc);
            break;
        case 1: // interesting
            await interesting(player, npc);
            break;
        // treasure
        case 2: {
            await npc.say('Wooooooo woo!');

            const choice = await player.ask(
                [
                    "Sorry I don't speak ghost",
                    "Thank you. You've been very helpful"
                ],
                true
            );

            switch (choice) {
                case 0: // dont speak ghost
                    await dontSpeakGhost(player, npc);
                    break;
                case 1: // thanks
                    await npc.say('Wooooooo');
                    break;
            }

            break;
        }
    }
}

async function taskToBeCompleted(player, npc) {
    await player.say(
        'I have been told a certain task may need to be completed',
        'So you can rest in peace'
    );

    await npc.say(
        'I should think it is probably because',
        'A warlock has come along and stolen my skull',
        'If you look inside my coffin there',
        "you'll find my corspse without a head on it"
    );

    await player.say('Do you know where this warlock might be now?');

    await npc.say(
        'I think it was one of the warlocks who lives in a big tower',
        'In the sea southwest from here'
    );

    await player.say(
        'Ok I will try and get the skull back for you, so you can rest in ' +
            'peace.'
    );

    await npc.say(
        'Ooh thank you, That would be such a great relief',
        'It is so dull being a ghost'
    );

    player.questStages.theRestlessGhost = 3;
}

async function helpMe(player, npc) {
    await npc.say("I don't suppose you can stop me being a ghost?");

    const choice = await player.ask(
        ["Yes, Ok. Do you know why you're a ghost?", "No, you're scary"],
        false
    );

    switch (choice) {
        case 0: // yes
            await player.say("Yes, Ok do you know why you're a ghost?");
            await npc.say("No, I just know I can't do anything much like this");
            await taskToBeCompleted(player, npc);
            break;
        case 1: // no scary
            await player.say("No, you're scary");
            break;
    }
}

async function onTalkToNPC(player, npc) {
    const questStage = player.questStages.theRestlessGhost;

    if (npc.id !== GHOST_ID || questStage === -1) {
        return false;
    }

    player.engage(npc);

    if (!player.inventory.isEquipped(GHOSTSPEAK_AMULET_ID)) {
        await noAmulet(player, npc);
    } else if (questStage === 2) {
        await player.say('Hello ghost, how are you?');
        await npc.say('Not very good actually');
        await player.say("What's the problem then?");
        await npc.say('Did you just understand what I said?');

        const choice = await player.ask(
            [
                'Yep, now tell me what the problem is',
                "No, you sound like you're speaking non-sense to me",
                'Wow, this amulet works'
            ],
            false
        );

        switch (choice) {
            case 0: // yes
                await player.say('Yep, now tell me what the problem is');

                await npc.say(
                    "Wow this is incredible, I didn't expect any one to " +
                        'understand me again'
                );

                await player.say(
                    'Yes, yes I can understand you',
                    'But have you any idea why you are doomed to be a ghost?'
                );

                await npc.say("I'm not sure");
                await taskToBeCompleted(player, npc);
                break;
            // no
            case 1: {
                await player.say('No');
                await npc.say("Oh that's a pity. You got my hopes up there");
                await player.say('Yeah, it is pity. Sorry');
                await npc.say('Hang on a second. You can understand me');

                const choice = await player.ask(
                    ["No I can't", "Yep clever aren't I"],
                    true
                );

                switch (choice) {
                    case 0: // no
                        await npc.say(
                            "I don't know, the first person I can speak to " +
                                'in ages is a moron'
                        );
                        break;
                    case 1: // yes
                        await npc.say(
                            "I'm impressed",
                            'You must be very powerfull'
                        );
                        await helpMe(player, npc);
                        break;
                }
                break;
            }
            case 2: // wow
                await player.say('Wow, this amulet works');

                await npc.say(
                    "Oh its your amulet that's doing it. I did wonder"
                );

                await helpMe(player, npc);
                break;
        }
    } else if (questStage === 3) {
        await npc.say('How are you doing finding my skull?');

        if (player.inventory.has(SKULL_ID)) {
            await player.say('I have found it');

            await npc.say(
                'Hurrah now I can stop being a ghost',
                'You just need to put it in my coffin over there',
                'And I will be free'
            );
        } else {
            await player.say("Sorry, I can't find it at the moment");

            await npc.say(
                'Ah well keep on looking',
                "I'm pretty sure it's somewhere in the tower south west from " +
                    'here',
                "There's a lot of levels to the tower, though",
                'I suppose it might take a little while to find'
            );

            delete player.cache.takenGhostSkull;
        }
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
