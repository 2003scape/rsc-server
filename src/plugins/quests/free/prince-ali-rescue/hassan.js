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
    } else if (questStage === 2) {
        await npc.say(
            'I understand the Spymaster has hired you',
            'I will pay the reward only when the Prince is rescued',
            'I can pay some expenses once the spymaster approves it'
        );
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
