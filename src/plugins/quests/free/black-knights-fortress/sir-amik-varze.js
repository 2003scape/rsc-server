// https://classic.runescape.wiki/w/Transcript:Sir_Amik_Varze

const SIR_AMIK_VARZE_ID = 110;

const COINS_ID = 10;

// minimum qp needed to start the quest
const MINIMUM_QP = 12;

async function initiateQuest(player, npc) {
    await npc.say(
        "You've come along just right actually",
        'All of my knights are known to the black knights already',
        "Subtlety isn't exactly our strong point"
    );

    await player.say('So what needs doing?');

    await npc.say(
        'Well the black knights have started making strange threats to us',
        'Demanding large amounts of money and land',
        "And threataning to invade Falador if we don't pay", // sic
        "Now normally this wouldn't be a problem",
        'But they claim to have a powerful new secret weapon',
        'What I want you to do is to get inside their fortress',
        'Find out what their secret weapon is',
        'And then sabotage it',
        'You will be well paid'
    );

    await player.say("OK I'll give it a try");

    player.questStages.blackKnightsFortress = 1;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== SIR_AMIK_VARZE_ID) {
        return false;
    }

    const { world } = player;
    const questStage = player.questStages.blackKnightsFortress;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'I am the leader of the white knights of Falador',
            'Why do you seek my audience?'
        );

        const choice = await player.ask(
            ['I seek a quest', "I don't I'm just looking around"],
            true
        );

        switch (choice) {
            // seeking a quest
            case 0: {
                if (player.questPoints < MINIMUM_QP) {
                    await npc.say(
                        'Well i do have a task, but it is very dangerous',
                        "and it's critical to us that no mistakes are made",
                        "I couldn't possibly let an unexperienced quester " +
                            'like yourself go'
                    );

                    player.message(
                        `@que@You need at least ${MINIMUM_QP} quest points ` +
                            'before you may attempt this quest'
                    );
                    break;
                }

                await npc.say(
                    'Well I need some spy work doing',
                    "It's quite dangerous",
                    "You will need to go into the Black Knight's fortress"
                );

                const choice = await player.ask(
                    [
                        'I laugh in the face of danger',
                        'I go and cower in a corner at the first sign of danger'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // laughs in the face of danger, quest accepted
                        await npc.say(
                            "Well that's good",
                            "Don't get too overconfident though"
                        );

                        await initiateQuest(player, npc);
                        break;
                    // cowers in a corner
                    case 1: {
                        await npc.say(
                            'Err',
                            'Well',
                            'spy work does involve a little hiding in little ' +
                                'corners I suppose'
                        );

                        const choice = await player.ask(
                            [
                                "Oh I suppose I'll give it a go then",
                                "No I'm not convinced"
                            ],
                            true
                        );

                        if (choice === 0) {
                            // quest accepted on second chance
                            await initiateQuest(player, npc);
                        }
                        break;
                    }
                }
                break;
            }
            case 1: // just looking around
                await npc.say("Ok, don't break anything");
                break;
        }
    } else if (questStage === 1) {
        // not having found about their plan
        await npc.say("How's the mission going?");

        await player.say(
            "I haven't managed to find what the secret weapon is yet."
        );
    } else if (questStage === 2) {
        // having heard their secret plan
        await npc.say("How's the mission going?");

        await player.say(
            "I've found out what the black knight's secret weapon is.",
            "It's a potion of invincibility."
        );
        await npc.say('That is bad news.');
    } else if (questStage === 3) {
        await player.say(
            "I have ruined the black knight's invincibilty potion.", // sic
            'That should put a stop to your problem.'
        );

        await npc.say(
            'Yes we have just received a message from the black knights.',
            'Saying they withdraw their demands.',
            'Which confirms your story'
        );

        await player.say('You said you were going to pay me');
        await npc.say("Yes that's right");

        player.message('@que@Sir Amik hands you 2500 coins');
        player.inventory.add(COINS_ID, 2500);
        await world.sleepTicks(3);

        player.message(
            '@que@Well done.You have completed the Black Knights fortress quest'
        );

        player.questStages.blackKnightsFortress = -1;
        player.addQuestPoints(3);
        player.message('@gre@You haved gained 3 quest points!'); // sic
    } else {
        await player.say('Hello Sir Amik');
        await npc.say('Hello friend');
    }

    player.disengage(npc);
    return true;
}

module.exports = { onTalkToNPC };
