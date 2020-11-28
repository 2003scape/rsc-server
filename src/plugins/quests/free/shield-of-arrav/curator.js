const BLACK_ARM_BROKEN_SHIELD_ID = 54;
const CERTIFICATE_ID = 61;
const CURATOR_ID = 39;
const PHOENIX_BROKEN_SHIELD_ID = 53;

async function onTalkToNPC(player, npc) {
    if (npc.id !== CURATOR_ID) {
        return false;
    }

    const hasBlackArmShield = player.inventory.has(BLACK_ARM_BROKEN_SHIELD_ID);
    const hasPhoenixShield = player.inventory.has(PHOENIX_BROKEN_SHIELD_ID);

    player.engage(npc);

    if (hasBlackArmShield && hasPhoenixShield) {
        const { world } = player;

        await player.say(
            'I have retrieved the shield of Arrav and I would like to claim ' +
                'my reward'
        );

        await npc.say('The shield of Arrav?', 'Let me see that');

        player.message('@que@The curator peers at the shield');
        await world.sleepTicks(3);

        await npc.say(
            'This is incredible',
            'That shield has been missing for about twenty five years',
            'Well give me the shield',
            "And I'll write you out a certificate",
            'Saying you have returned the shield',
            'So you can claim your reward from the king'
        );

        await player.say(
            'Can I have two certificates?',
            'I needed significant help from a friend to get the shield',
            "We'll split the reward"
        );

        await npc.say('Oh ok');

        player.inventory.remove(BLACK_ARM_BROKEN_SHIELD_ID);
        player.inventory.remove(PHOENIX_BROKEN_SHIELD_ID);
        player.message('@que@You hand over the shield parts');
        await world.sleepTicks(3);

        player.inventory.add(CERTIFICATE_ID, 2);
        player.message('@que@The curator writes out two certificates');
        await world.sleepTicks(3);

        await npc.say(
            'Take these to the king',
            "And he'll pay you both handsomely"
        );
    } else if (hasBlackArmShield || hasPhoenixShield) {
        await player.say(
            'I have half the shield of Arrav here',
            'Can I get a reward'
        );

        await npc.say(
            'Well it might be worth a small reward',
            'The entire shield would me worth much much more'
        );

        await player.say(
            "Ok I'll hang onto it",
            'And see if I can find the other half'
        );
    } else {
        await npc.say('Welcome to the museum of Varrock');

        const choice = await player.ask(
            [
                'Have you any interesting news?',
                'Do you know where I could find any treasure?'
            ],
            true
        );

        switch (choice) {
            case 0: // interesting news
                await npc.say("No, I'm only interested in old stuff");
                // me too
                break;
            case 1: // treasure
                await npc.say('This museum is full of treasures');
                await player.say('No, I meant treasures for me');

                await npc.say(
                    'Any treasures this museum knows about',
                    'It aquires'
                );
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
