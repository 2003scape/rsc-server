// https://classic.runescape.wiki/w/Transcript:Hassan

const HASSAN_ID = 119;
const WATER_ID = 50;

async function onTalkToNPC(player, npc) {
    if (npc.id !== HASSAN_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'Greetings. I am Hassan, Chancellor to the Emir of Al Kharid'
        );

        const choice = await player.ask(
            [
                'Can I help you? You must need some help here in the desert.',
                'Its just too hot here. How can you stand it?',
                'Do you mind if I just kill your Warriors?'
            ],
            false
        );

        switch (choice) {
            case 0: // can i help
                await player.say(
                    'Can I help you? You must need some help here in the desert'
                );

                await npc.say(
                    'I need the services of someone, yes.',
                    'If you are interested, see the spymaster, Osman',
                    'I manage the finances here. come to me when you need ' +
                        'payment'
                );

                player.questStages.princeAliRescue = 1;
                break;
            case 1: // too hot
                await player.say(
                    'Its just too hot here. How can you stand it?'
                );

                await npc.say(
                    'We manage, in our humble way. We are a wealthy town',
                    'And we have water. It cures many thirsts'
                );

                player.inventory.add(WATER_ID);
                player.message('The chancellor hands you some water');
                break;
            case 2: // kill your warriors
                await player.say('Do you mind if I just kill your warriors?');

                await npc.say(
                    'You are welcome. They are not expensive.',
                    'We have them here to stop the elite guard being bothered',
                    'They are a little harder to kill.'
                );
                break;
        }
    } else if (questStage === 1) {
        await npc.say(
            'Have you found the spymaster, Osman, Yet?',
            'You cannot proceed in your task without reporting to him'
        );
    } else if (questStage === 2 || questStage === 3) {
        const keyMade = !!player.cache.bronzeKeyMade;
        const keyPaid = !!player.cache.bronzeKeyPaid;
        const keyReceived = !!player.cache.bronzeKeyReceived;

        if (keyMade || keyReceived) {
            if (keyPaid) {
                await npc.say(
                    'Hello again adventurer',
                    'You have received payment for your tasks so far',
                    'No more will be paid until the Prince is rescued'
                );
            } else {
                await npc.say(
                    'You have proved your services useful to us',
                    'Here is 80 coins for the work you have already done'
                );

                player.inventory.add(10, 80);
                player.message('@que@The chancellor hands you 80 coins');
                player.cache.bronzeKeyPaid = true;
            }
        } else {
            await npc.say(
                'I understand the Spymaster has hired you',
                'I will pay the reward only when the Prince is rescued',
                'I can pay some expenses once the spymaster approves it'
            );
        }
    } else if (questStage === 4) {
        await npc.say(
            'You have the eternal gratitude of the Emir for rescuing his son'
        );

        await npc.say('I am authorised to pay you 700 coins');

        if (player.cache.bronzeKeyPaid) {
            await npc.say('80 was put aside for the key. that leaves 620');

            player.inventory.add(10, 620);
            player.message('@que@The chancellor pays you 620 coins');
        } else {
            player.inventory.add(10, 700);
            player.message('@que@The chancellor pays you 700 coins');
        }

        player.message(
            'You have completed the quest of the Prince of Al Kharid'
        );

        delete player.cache.bronzeKeyPaid;
        delete player.cache.bronzeKeyMade;
        delete player.cache.bronzeKeyReceived;
        delete player.cache.keliTiedOnce;
        delete player.cache.joeDrunk;

        player.questStages.princeAliRescue = -1;
        player.addQuestPoints(3);

        player.message('@gre@You haved gained 3 quest points!');
    } else if (questStage === -1) {
        await npc.say(
            'You are a friend of the town of Al Kharid',
            'Please, keep in contact. Good employees are not easy to find'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
