// https://classic.runescape.wiki/w/Transcript:Romeo

const CADAVA_POTION_ID = 57;
const MESSAGE_ID = 56;
const ROMEO_ID = 30;

async function initiateQuest(player, npc) {
    await player.say('Yes, I will tell her how you feel');
    await npc.say('You are the saviour of my heart, thank you.');
    await player.say('err, yes. Ok. Thats.... nice.');
    player.questStages.romeoAndJuliet = 1;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== ROMEO_ID) {
        return false;
    }

    const questStage = player.questStages.romeoAndJuliet;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'Juliet, Juliet, Juliet! Wherefore Art thou?',
            'Kind friend, Have you seen Juliet?',
            'Her and her Father seem to have disappeared'
        );

        const choice = await player.ask(
            [
                'Yes, I have seen her',
                "No, but that's a girl for you",
                'Can I help find her for you?'
            ],
            false
        );

        switch (choice) {
            // yes
            case 0: {
                await player.say(
                    'Yes, I have seen her',
                    'I think it was her. Blond, stressed'
                );

                await npc.say(
                    'Yes, that sounds like her',
                    'Please tell her I long to be with her'
                );

                const choice = await player.ask(
                    [
                        'Yes, I will tell her',
                        'Sorry, I am too busy. Maybe later?'
                    ],
                    false
                );

                switch (choice) {
                    case 0: // yes
                        await initiateQuest(player, npc);
                        break;
                    case 1: // later
                        await player.say('Sorry, I am too busy. Maybe later?');

                        await npc.say(
                            'Well if you do find her, I would be most grateful'
                        );
                        break;
                }
                break;
            }
            // no
            case 1: {
                await player.say("No, but that's girls for you");

                await npc.say(
                    'Not my dear Juliet. She is different',
                    'Could you find her for me?',
                    'Please tell her I long to be with her'
                );

                const choice = await player.ask(
                    [
                        'Yes, I will tell her how you feel ',
                        "I can't, it sounds like work for me"
                    ],
                    false
                );

                switch (choice) {
                    case 0: // yes
                        await initiateQuest(player, npc);
                        break;
                    case 1: // no
                        await player.say("I can't, it sounds like work to me");

                        await npc.say(
                            'Well, I guess you are not the romantic type',
                            'Goodbye'
                        );
                        break;
                }
                break;
            }
            case 2: // find her
                await player.say('Can I help find her for you?');
                await npc.say('Oh would you? That would be wonderful!');
                await initiateQuest(player, npc);
                break;
        }
    } else if (questStage === 1) {
        await npc.say('Please find my Juliet. I am so, so sad');
    } else if (questStage === 2) {
        const { world } = player;
        const lostMessages = player.cache.lostJulietMessages || 0;
        const haveMessage = player.inventory.has(MESSAGE_ID);

        if (lostMessages === 2 && haveMessage) {
            await npc.say(
                'Ah, it seems that you can deliver a message after all',
                'My faith in you is restored!'
            );
        } else {
            await player.say('Romeo, I have a message from Juliet');
        }

        if (lostMessages > 0 || !haveMessage) {
            await player.say('Except that I seem to have lost it');
        }

        if (haveMessage) {
            player.inventory.remove(MESSAGE_ID);
            player.message("@que@You pass Juliet's message to Romeo");
            await world.sleepTicks(2);

            await npc.say(
                'Tragic news. Her father is opposing our marriage',
                'If her father sees me, he will kill me',
                'I dare not go near his lands',
                'She says Father Lawrence can help us',
                'Please find him for me. Tell him of our plight'
            );

            delete player.cache.lostJulietMessages;
            player.questStages.romeoAndJuliet = 3;
        }
    } else if (questStage === 3) {
        await npc.say('Please friend, how goes our quest?');
        await player.say('Father Lawrence must be told. only he can help');
    } else if (questStage === 4) {
        await npc.say('Did you find the Father? What did he suggest?');

        const choice = await player.ask(
            [
                'He seems keen for you to marry Juliet',
                'He sent me to the Apothecary'
            ],
            true
        );

        switch (choice) {
            case 0: // marry
                await npc.say(
                    'I think he wants some peace. He was our messenger',
                    'before you were kind enough to help us'
                );
                break;
            case 1: // apothecary
                await npc.say(
                    'I know him. He lives near the town square',
                    'the small house behind the sloped building',
                    'Good luck'
                );
                break;
        }
    } else if (questStage === 5) {
        if (player.inventory.has(CADAVA_POTION_ID)) {
            await npc.say(
                'Ah, you have the potion. I was told what to do by the good ' +
                    'Father',
                'Better get it to Juliet. She knows what is happening'
            );
        } else {
            await npc.say(
                'I hope the potion is near ready',
                'It is the last step for the great plan',
                'I hope I will be with my dear one soon'
            );
        }
    } else if (questStage === 6) {
        await player.say("Romeo, it's all set. Juliet has the potion");
        await npc.say('Ah right', 'What potion would that be then?');
        await player.say('The one to get her to the crypt.');

        await npc.say(
            'Ah right',
            'So she is dead then. Ah thats a shame.',
            'Thanks for you help anyway.'
        );

        player.message('@que@You have completed the quest of Romeo and Juliet');

        player.questStages.romeoAndJuliet = -1;
        player.addQuestPoints(5);
        player.message('@gre@You haved gained 5 quest points!');
    } else if (questStage === -1) {
        await npc.say(
            'I heard Juliet had died. Terrible business',
            'Her cousin and I are getting on well though',
            'Thanks for your help'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
