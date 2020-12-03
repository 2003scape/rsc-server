// https://classic.runescape.wiki/w/Transcript:Hetty

const HETTY_ID = 148;

// the rats that can drop a tail
const RAT_IDS = new Set([19, 29, 47, 177, 367, 473]);

const COOKS_RANGE_ID = 119;

const CAULDRON_ID = 147;
const COOKABLE_IDS = new Set([COOKS_RANGE_ID, 11, 97, 119, 274, 491]);

const BURNTMEAT_ID = 134;
const COOKEDMEAT_ID = 132;
const EYE_OF_NEWT_ID = 270;
const ONION_ID = 241;
const RAT_TAIL_ID = 271;

async function initiateQuest(player, npc) {
    await npc.say(
        "Ok I'm going to make a potion to help bring out your darker self",
        'So that you can perform acts of dark magic with greater ease',
        'You will need certain ingredients'
    );

    await player.say('What do I need');

    await npc.say(
        "You need an eye of newt, a rat's tail," +
            'an onion and a piece of burnt meat'
    );

    player.questStages.witchsPotion = 1;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== HETTY_ID) {
        return false;
    }

    const { world } = player;
    const questStage = player.questStages.witchsPotion;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'Greetings Traveller',
            'What could you want with an old woman like me?'
        );

        const choice = await player.ask(
            ['I am in search of a quest', "I've heard that you're a witch"],
            true
        );

        switch (choice) {
            // search of quest
            case 0: {
                await npc.say(
                    'Hmm maybe I can think of something for you',
                    'Would you like to become more proficient in the dark arts?'
                );

                const choice = await player.ask(
                    [
                        'Yes help me become one with my darker side',
                        'No I have my principles and honour',
                        'What you mean improve my magic?'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // yes
                        await initiateQuest(player, npc);
                        break;
                    case 1: // denied quest
                        await npc.say("Suit yourself, but you're missing out");
                        break;
                    // improve my magic?
                    case 2: {
                        await npc.say(
                            'Yes improve your magic',
                            'Do you have no sense of drama?'
                        );

                        const choice = await player.ask(
                            [
                                "Yes I'd like to improve my magic",
                                "No I'm not interested",
                                'Show me the mysteries of the dark arts'
                            ],
                            true
                        );

                        switch (choice) {
                            case 0: // yes
                                player.message('@que@The witch sighs');
                                await world.sleepTicks(2);
                                await initiateQuest(player, npc);
                                break;
                            case 1: // no
                                await npc.say(
                                    "Many aren't to start off with",
                                    "But I think you'll be drawn back to " +
                                        'this place'
                                );
                                break;
                            case 2: // enthused yes
                                await initiateQuest(player, npc);
                                break;
                        }
                        break;
                    }
                }
                break;
            }
            case 1: // heard you're a witch
                await npc.say(
                    'Yes it does seem to be getting fairly common knowledge',
                    'I fear I may get a visit from the witch hunters of ' +
                        'Falador before long'
                );
                break;
        }
    } else if (questStage === 1) {
        await npc.say(
            'Greetings Traveller',
            'So have you found the things for the potion'
        );

        const hasIngredients =
            player.inventory.has(RAT_TAIL_ID) &&
            player.inventory.has(EYE_OF_NEWT_ID) &&
            player.inventory.has(BURNTMEAT_ID) &&
            player.inventory.has(ONION_ID);

        if (hasIngredients) {
            const { world } = player;

            await player.say('Yes I have everything');
            await npc.say('Excellent, can I have them then?');

            player.message('You pass the ingredients to Hetty');
            player.inventory.remove(RAT_TAIL_ID);
            player.inventory.remove(EYE_OF_NEWT_ID);
            player.inventory.remove(BURNTMEAT_ID);
            player.inventory.remove(ONION_ID);

            player.message("Hetty put's all the ingredients in her cauldron");
            await world.sleepTicks(3);

            player.message('Hetty closes her eyes and begins to chant');
            await world.sleepTicks(3);

            await npc.say('Ok drink from the cauldron');

            player.questStages.witchsPotion = 2;
        } else {
            await player.say('No not yet');

            await npc.say(
                'Well remember you need to get',
                "An eye of newt, a rat's tail,some burnt meat and an onion"
            );
        }
    } else if (questStage === 2) {
        await npc.say(
            'Greetings Traveller',
            'Well are you going to drink the potion or not?'
        );
    } else {
        await npc.say('Greetings Traveller', "How's your magic coming along?");
        await player.say("I'm practicing and slowly getting better");
        await npc.say('good good');
    }

    player.disengage();
    return true;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== CAULDRON_ID) {
        return false;
    }

    if (player.questStages.witchsPotion !== 2) {
        await player.say("I'd rather not", "It doesn't look very tasty");
        return true;
    }

    const { world } = player;

    player.message('@que@You drink from the cauldron');
    await world.sleepTicks(5);

    player.message('@que@You feel yourself imbued with power');
    await world.sleepTicks(3);

    player.message(
        '@que@Well done you have completed the witches potion quest'
    );

    player.addExperience('magic', player.skills.magic.base * 200 + 900, false);

    player.questStages.witchsPotion = -1;
    player.addQuestPoints(1);
    player.message('@gre@You haved gained 1 quest point');

    return true;
}

async function onNPCDeath(player, npc) {
    if (player.questStages.witchsPotion === 1 && RAT_IDS.has(npc.id)) {
        const { world } = player;
        world.addPlayerDrop(player, { id: RAT_TAIL_ID });
    }

    // still return false so default gets called and they still drop bones
    return false;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (player.questStages.witchsPotion !== 1) {
        return false;
    }

    if (
        item.id !== COOKEDMEAT_ID ||
        (gameObject.id === COOKS_RANGE_ID &&
            player.questStages.cooksAssistant !== -1)
    ) {
        return false;
    }

    if (!COOKABLE_IDS.has(gameObject.id)) {
        return false;
    }

    const type = /fire/i.test(gameObject.definition.name) ? 'fire' : 'stove';

    player.sendBubble(item.id);
    player.inventory.remove(COOKEDMEAT_ID);
    player.inventory.add(BURNTMEAT_ID);

    // no delay https://youtu.be/r6_LUl8-4uk?t=191
    player.message(`You cook the meat on the ${type}...`, 'you burn the meat');

    return true;
}

module.exports = {
    onTalkToNPC,
    onGameObjectCommandTwo,
    onNPCDeath,
    onUseWithGameObject
};
