// https://classic.runescape.wiki/w/Transcript:Father_Lawrence

const CADAVABERRIES_ID = 55;
const CADAVA_POTION_ID = 57;
const LAWRENCE_ID = 32;
const MESSAGE_ID = 56;

async function onTalkToNPC(player, npc) {
    if (npc.id !== LAWRENCE_ID) {
        return false;
    }

    const questStage = player.questStages.romeoAndJuliet;
    const haveMessage =
        player.inventory.has(MESSAGE_ID) || player.bank.has(MESSAGE_ID);
    const lostMessages = player.cache.lostJulietMessages || 0;

    player.engage(npc);

    if (
        !questStage ||
        questStage === 1 ||
        (questStage === 2 && (lostMessages < 2 || haveMessage))
    ) {
        await npc.say('Hello adventurer, do you seek a quest?');

        const choice = await player.ask(
            [
                'I am always looking for a quest',
                'No, I prefer to kill things',
                'Can you recommend a good bar?'
            ],
            true
        );

        switch (choice) {
            case 0: // quest
                await npc.say(
                    'Well, I see poor Romeo wandering around the square. I ' +
                        'think he may need help',
                    'I was helping him and Juliet to meet, but it became ' +
                        'impossible',
                    'I am sure he can use some help'
                );
                break;
            case 1: // killing
                await npc.say(
                    "That's a fine career in these lands",
                    'There is more that needs killing every day'
                );
                break;
            case 2: // bar
                await npc.say(
                    'Drinking will be the death of you',
                    'But the Blue Moon in the city is cheap enough',
                    'And providing you buy one drink an hour they let you ' +
                        'stay all night'
                );
                break;
        }
    } else if (
        (questStage === 2 && lostMessages > 1 && !haveMessage) ||
        questStage === 6 ||
        questStage === -1
    ) {
        const lawrenceNeedsDrink =
            questStage === -1 && !!player.cache.lawrenceNeedsDrink;

        await npc.say(
            'Oh to be a father in the times of whiskey',
            'I sing and I drink and I wake up in gutters'
        );

        if (lawrenceNeedsDrink) {
            await npc.say('I need a think I drink');
        } else {
            await npc.say(
                'Top of the morning to you',
                'To err is human, to forgive, quite difficult'
            );
        }

        if (questStage === -1) {
            player.cache.lawrenceNeedsDrink = true;
        }
    } else if (questStage === 3) {
        await player.say('Romeo sent me. Hey says you can help');
        await npc.say('Ah Romeo, yes. A fine lad, but a little bit confused');
        await player.say('Juliet must be rescued from her fathers control');

        await npc.say(
            'I know just the thing. A potion to make her appear dead',
            'Then Romeo can collect her from the crypt',
            'Go to the Apothecary, tell him I sent you',
            'You need some Cadava Potion'
        );

        player.questStages.romeoAndJuliet = 4;
    } else if (questStage === 4) {
        await npc.say(
            'Ah have you found the Apothecary yet?',
            'Remember, Cadava potion, for Father Lawrence'
        );
    } else if (questStage === 5) {
        await npc.say('Did you find the Apothecary?');

        const hasBerries = player.inventory.has(CADAVABERRIES_ID);
        const hasPotion = player.inventory.has(CADAVA_POTION_ID);

        if (hasPotion || !hasBerries) {
            await player.say('Yes, I must find some berries');

            await npc.say(
                'Well, take care. They are poisonous to the touch',
                'You will need gloves'
            );
        }

        if (hasPotion || hasBerries) {
            await player.say('I am on my way back to him with the ingredients');

            await npc.say(
                'Good work. Get the potion to Juliet when you have it',
                'I will tell Romeo to be ready'
            );
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
