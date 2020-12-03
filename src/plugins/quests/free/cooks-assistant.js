// https://classic.runescape.wiki/w/Transcript:Cook
// https://classic.runescape.wiki/w/Cook%27s_assistant

const COOKS_RANGE_ID = 119;
const COOK_ID = 7;
const EGG_ID = 19;
const FLOUR_ID = 136;
const MILK_ID = 22;

async function whatsWrong(player, npc) {
    await npc.say(
        "Ooh dear I'm in a terrible mess",
        "It's the duke's birthday today",
        "I'm meant to be making him a big cake for this evening",
        "Unfortunately, I've forgotten to buy some of the ingredients",
        "I'll never get them in time now",
        "I don't suppose you could help me?"
    );

    const choice = await player.ask(
        ["Yes, I'll help you", "No, I don't feel like it. Maybe later"],
        true
    );

    switch (choice) {
        case 0: // yes
            await npc.say(
                'Oh thank you, thank you',
                'I need milk, eggs and flour',
                "I'd be very grateful if you can get them to me"
            );

            player.questStages.cooksAssistant = 1;
            break;
        case 1: // no
            await npc.say('OK, suit yourself');
            break;
    }
}

async function niceHat(npc) {
    await npc.say("Err thank you -it's a pretty ordinary cooks hat really");
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== COOK_ID) {
        return false;
    }

    player.engage(npc);

    const questStage = player.questStages.cooksAssistant;

    if (!questStage) {
        await npc.say('What am I to do?');

        const choice = await player.ask(
            [
                "What's wrong?",
                'Well you could give me all your money',
                "You don't look very happy",
                'Nice hat'
            ],
            true
        );

        switch (choice) {
            case 0: // whats wrong
                await whatsWrong(player, npc);
                break;
            case 1: // money
                await npc.say('HaHa very funny');
                break;
            // dont look happy
            case 2: {
                await npc.say("No, I'm not");

                const choice = await player.ask(
                    [
                        "What's wrong?",
                        "I'd take the rest of the day off if I were you"
                    ],
                    true
                );

                switch (choice) {
                    case 0: // whats wrong
                        await whatsWrong(player, npc);
                        break;
                    case 1: // day off
                        await npc.say(
                            "No, that's the worst thing I could do - I'd get " +
                                'in terrible trouble'
                        );
                        await player.say("What's wrong?");
                        await whatsWrong(player, npc);
                        break;
                }

                break;
            }
            case 3: // nice hat
                await niceHat(npc);
                break;
        }
    } else if (questStage === 1) {
        await npc.say('How are you getting on with finding the ingredients?');

        if (
            !player.inventory.has(MILK_ID) &&
            !player.inventory.has(FLOUR_ID) &&
            !player.inventory.has(EGG_ID)
        ) {
            await player.say("I'm afraid I don't have any yet!");

            await npc.say(
                'Oh dear oh dear!',
                'I need flour, eggs, and milk',
                'Without them I am doomed!'
            );
        } else if (
            player.inventory.has(MILK_ID) &&
            player.inventory.has(FLOUR_ID) &&
            player.inventory.has(EGG_ID)
        ) {
            await player.say(
                'I now have everything you need for your cake',
                'Milk, flour, and an egg!'
            );

            await npc.say('I am saved thankyou!');

            player.inventory.remove(MILK_ID);
            player.inventory.remove(FLOUR_ID);
            player.inventory.remove(EGG_ID);

            player.message(
                '@que@You give some milk, an egg and some flour to the cook',
                "Well done. You have completed the cook's assistant quest"
            );

            player.addExperience(
                'cooking',
                player.skills.cooking.base * 200 + 1000,
                false
            );

            player.questStages.cooksAssistant = -1;
            player.addQuestPoints(1);
            player.message('@gre@You haved gained 1 quest point!');
        } else {
            await player.say('I have found some of the things you asked for:');

            if (player.inventory.has(MILK_ID)) {
                await player.say('I have some milk');
            }

            if (player.inventory.has(FLOUR_ID)) {
                await player.say('I have some flour');
            }

            if (player.inventory.has(EGG_ID)) {
                await player.say('I have an egg');
            }

            await npc.say(
                'Great, but can you get the other ingredients as well?',
                'You still need to find'
            );

            if (!player.inventory.has(MILK_ID)) {
                await npc.say('Some milk');
            }

            if (!player.inventory.has(FLOUR_ID)) {
                await npc.say('Some flour');
            }

            if (!player.inventory.has(EGG_ID)) {
                await npc.say('An egg');
            }
        }
    } else if (questStage === -1) {
        await npc.say('Hello friend, how is the adventuring going?');

        const choice = await player.ask(
            [
                'I am getting strong and mighty',
                'I keep on dying',
                'Nice hat',
                'Can I use your range?'
            ],
            true
        );

        switch (choice) {
            case 0: // strong & mighty
                await npc.say('Glad to hear it');
                break;
            case 1: // dying
                await npc.say('Ah well at least you keep coming back to life!');
                break;
            case 2: // nice hat
                await niceHat(npc);
                break;
            case 3: // range
                await npc.say(
                    'Go ahead',
                    "It's a very good range",
                    "It's easier to use than most other ranges"
                );
                break;
        }
    }

    player.disengage();
    return true;
}

async function onUseWithGameObject(player, gameObject) {
    if (
        gameObject.id !== COOKS_RANGE_ID ||
        player.questStages.cooksAssistant === -1
    ) {
        return false;
    }

    const { world } = player;
    const cook = world.npcs.getByID(COOK_ID);

    if (cook && !cook.interlocutor) {
        player.engage(cook);
        await cook.say('Hey! Who said you could use that?');
        player.disengage();
    }

    return true;
}

module.exports = { onTalkToNPC, onUseWithGameObject };
