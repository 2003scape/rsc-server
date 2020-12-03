// https://classic.runescape.wiki/w/Transcript:Fred_the_farmer
// https://classic.runescape.wiki/w/Sheep_shearer

const BALL_OF_WOOL_ID = 207;
const FRED_ID = 77;
const WOOL_ID = 145;

async function initiateQuest(player, npc) {
    await npc.say("Ok I'll see you when you have some wool");

    player.questStages.sheepShearer = 1;
}

async function somethingToKill(npc) {
    await npc.say('What on my land?', 'Leave my livestock alone you scoundrel');
}

async function imLost(npc) {
    await npc.say(
        'How can you be lost?',
        'Just follow the road east and south',
        "You'll end up in Lumbridge fairly quickly"
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== FRED_ID) {
        return false;
    }

    player.engage(npc);

    const questStage = player.questStages.sheepShearer;

    if (!questStage) {
        await npc.say(
            'What are you doing on my land?',
            "You're not the one who keeps leaving all my gates open?",
            'And letting out all my sheep?'
        );

        const choice = await player.ask(
            [
                "I'm looking for a quest",
                "I'm looking for something to kill",
                "I'm lost"
            ],
            true
        );

        switch (choice) {
            // quest
            case 0: {
                await npc.say(
                    "You're after a quest, you say?",
                    'Actually I could do with a bit of help',
                    'My sheep are getting mighty woolly',
                    'If you could shear them',
                    'And while your at it spin the wool for me too',
                    "Yes that's it. Bring me 20 balls of wool",
                    "And I'm sure I could sort out some sort of payment",
                    "Of course, there's the small matter of the thing"
                );

                const choice = await player.ask(
                    [
                        'Yes okay. I can do that',
                        "That doesn't sound a very exciting quest",
                        'What do you mean, the thing?'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // okay
                        await initiateQuest(player, npc);
                        break;
                    // not exciting
                    case 1: {
                        await npc.say(
                            'Well what do you expect if you ask a farmer for ' +
                                'a quest?',
                            'Now are you going to help me or not?'
                        );

                        const choice = await player.ask(
                            [
                                'Yes okay. I can do that',
                                "No I'll give it a miss"
                            ],
                            true
                        );

                        if (choice === 0) {
                            await initiateQuest(player, npc);
                        }
                        break;
                    }
                    // the thing
                    case 2: {
                        await npc.say(
                            "I wouldn't worry about it",
                            'Something ate all the previous shearers',
                            'They probably got unlucky',
                            'So are you going to help me?'
                        );

                        const choice = await player.ask(
                            [
                                'Yes okay. I can do that',
                                "Erm I'm a bit worried about this thing"
                            ],
                            true
                        );

                        switch (choice) {
                            case 0: // okay
                                await initiateQuest(player, npc);
                                break;
                            case 1: // thing
                                await npc.say(
                                    "I'm sure it's nothing to worry about",
                                    "It's possible the other shearers aren't " +
                                        'dead at all',
                                    'And are just hiding in the woods or ' +
                                        'something'
                                );

                                await player.say("I'm not convinced");
                                break;
                        }
                        break;
                    }
                }
                break;
            }
            case 1: // something to kill
                await somethingToKill(npc);
                break;
            case 2: // lost
                await imLost(npc);
                break;
        }
    } else if (questStage === 1) {
        await npc.say('How are you doing getting those balls of wool?');

        if (player.inventory.has(BALL_OF_WOOL_ID)) {
            const { world } = player;

            await player.say('I have some');
            await npc.say('Give em here then');

            while (player.inventory.has(BALL_OF_WOOL_ID)) {
                const fredWool = player.cache.fredWool || 0;

                player.message('You give Fred a ball of wool');
                player.inventory.remove(BALL_OF_WOOL_ID);
                player.cache.fredWool = fredWool + 1;

                await world.sleepTicks(5);

                if (player.cache.fredWool >= 20) {
                    delete player.cache.fredWool;
                    await player.say('Thats all of them');
                    await npc.say("I guess I'd better pay you then");

                    player.message('The farmer hands you some coins');
                    player.inventory.add(10, 60);

                    player.message(
                        'Well done you have completed the sheep shearer quest'
                    );

                    player.addExperience(
                        'crafting',
                        player.skills.crafting.base * 100 + 500,
                        false
                    );

                    player.questStages.sheepShearer = -1;
                    player.addQuestPoints(1);
                    player.message('@gre@You haved gained 1 quest point');

                    player.disengage();
                    return true;
                }
            }

            await player.say("That's all I've got so far");
            await npc.say('I need more before I can pay you');
            await player.say("Ok I'll work on it");
        } else if (player.inventory.has(WOOL_ID)) {
            await player.say(
                "Well I've got some wool",
                "I've not managed to make it into a ball though"
            );

            await npc.say(
                'Well go find a spinning wheel then',
                'And get spinning'
            );
        } else {
            await player.say("I haven't got any at the moment");
            await npc.say("Ah well at least you haven't been eaten");
        }
    } else {
        await npc.say('What are you doing on my land?');

        const choice = await player.ask(
            ["I'm looking for something to kill", "I'm lost"],
            true
        );

        switch (choice) {
            case 0: // something to kill
                await somethingToKill(npc);
                break;
            case 1: // lost
                await imLost(npc);
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
