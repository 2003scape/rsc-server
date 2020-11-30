// https://classic.runescape.wiki/w/Imp_catcher
// https://classic.runescape.wiki/w/Transcript:Wizard_Mizgog

const ACCURACY_AMULET_ID = 235;
const BEAD_IDS = [231, 232, 233, 234];
const MIZGOG_ID = 117;

async function quietFriends(npc) {
    await npc.say(
        "Yes they've mostly got their heads in the clouds",
        'Thinking about magic'
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== MIZGOG_ID) {
        return false;
    }

    player.engage(npc);

    const questStage = player.questStages.impCatcher;

    if (!questStage) {
        await npc.say('Hello there');

        const choice = await player.ask(
            [
                'Give me a quest!',
                "Most of your friends are pretty quiet aren't they?"
            ],
            true
        );

        switch (choice) {
            // give me a quest
            case 0: {
                await npc.say('Give me a quest what?');

                const choice = await player.ask(
                    [
                        'Give me a quest please',
                        'Give me a quest or else',
                        'Just stop messing around and give me a quest'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // please
                        await npc.say(
                            'Well seeing as you asked nicely',
                            'I could do some help',
                            "The wizard Grayzag next door decided he didn't " +
                                'like me',
                            'So he cast of spell of summoning',
                            'And summoned hundred of little imps',
                            'These imps stole all sorts of my things',
                            "Most of these things I don't really care about",
                            "They're just eggs and balls of string and things",
                            'But they stole my 4 magical beads',
                            'There was a red one, a yellow one, a black one ' +
                                'and a white one',
                            'These imps have now spread out all over the ' +
                                'kingdom',
                            'Could you get my beads back for me'
                        );

                        await player.say("I'll try");
                        player.questStages.impCatcher = 1;
                        break;
                    case 1: // or else
                        await npc.say(
                            "Or else what? You'll attack me?",
                            'Hahaha'
                        );
                        break;
                    case 2: // messing around
                        await npc.say(
                            "Ah now you're assuming I have one to give"
                        );
                        break;
                }
                break;
            }
            case 1: // quiet friends
                await quietFriends(npc);
                break;
        }
    } else if (questStage === 1) {
        await npc.say('So how are you doing finding my beads');

        let beadsFound = 0;

        for (const beadID of BEAD_IDS) {
            if (player.inventory.has(beadID)) {
                beadsFound += 1;
            }
        }

        if (beadsFound === 0) {
            await player.say("I've not found any yet");

            await npc.say(
                'Well get on with it',
                "I've lost a white bead, a red bead, a black bead and a " +
                    'yellow bead',
                'Go kill some imps'
            );
        } else if (beadsFound <= 3) {
            await player.say('I have found some of your beads');
            await npc.say(
                'Come back when you have them all',
                'The four colours of beads I need',
                'Are red,yellow,black and white',
                'Go chase some imps'
            );
        } else {
            const { world } = player;

            await player.say(
                "I've got all four beads",
                'It was hard work I can tell you'
            );

            await npc.say("Give them here and I'll sort out a reward");

            for (const beadID of BEAD_IDS) {
                player.inventory.remove(beadID);
            }

            player.message('You give four coloured beads to Wizard Mizgog');
            await world.sleepTicks(2);

            await npc.say("Here's you're reward then", 'An amulet of accuracy');
            player.message('The Wizard hands you an amulet');
            player.inventory.add(ACCURACY_AMULET_ID);
            await world.sleepTicks(2);

            player.message(
                'Well done. You have completed the Imp catcher quest'
            );

            player.addExperience(
                'magic',
                player.skills.magic.base * 400 + 1500,
                false
            );

            player.questStages.impCatcher = -1;
            player.addQuestPoints(1);
            player.message('@gre@You haved gained 1 quest point');
        }
    } else {
        const choice = await player.ask(
            [
                'Got any more quests?',
                "Most of your friends are pretty quiet aren't they?"
            ],
            true
        );

        switch (choice) {
            case 0: // more quests
                await npc.say('No Everything is good with the world today');
                break;
            case 1: // quiet friends
                await quietFriends(npc);
                break;
        }
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
