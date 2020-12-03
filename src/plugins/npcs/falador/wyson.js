// https://classic.runescape.wiki/w/Transcript:Wyson_the_gardener

const WOAD_LEAF_ID = 281;
const WYSON_ID = 116;

async function howMuch(player, npc) {
    await npc.say('How much are you willing to pay?');

    const choice = await player.ask(
        [
            'How about 5 coins?',
            'How about 10 coins?',
            'How about 15 coins?',
            'How about 20 coins?'
        ],
        true
    );

    switch (choice) {
        case 0: // 5
        case 1: // 10
            await npc.say(
                'No No thats far too little. Woad leaves are hard to get you ' +
                    'know',
                'I used to have plenty but someone kept stealing them off me'
            );
            break;
        case 2: // 15
            await npc.say('Mmmm Ok that sounds fair.');
            if (player.inventory.has(10, 15)) {
                player.inventory.remove(10, 15);
                player.message('You give wyson 15 coins');
                player.inventory.add(WOAD_LEAF_ID);
                player.message('Wyson the gardener gives you some woad leaves');
            } else {
                await player.say(
                    "I dont have enough coins to buy the leaves. I'll come " +
                        'back later'
                );
            }
            break;
        case 3: // 20
            await npc.say("Ok that's more than fair.");
            if (player.inventory.has(10, 20)) {
                player.inventory.remove(10, 20);
                player.message('You give wyson 20 coins');
                player.inventory.add(WOAD_LEAF_ID);
                player.message('Wyson the gardener gives you some woad leaves');
                await npc.say("Here have some more you're a generous person");
                player.inventory.add(WOAD_LEAF_ID);
                player.message('Wyson the gardener gives you some woad leaves');
            } else {
                await player.say(
                    "I dont have enough coins to buy the leaves. I'll come " +
                        'back later'
                );
            }
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== WYSON_ID) {
        return false;
    }

    player.engage(npc);

    if (player.questStages.goblinDiplomacy !== -1) {
        await npc.say(
            'I am the gardener round here',
            'Do you have any gardening that needs doing?'
        );

        const choice = await player.ask(
            ["I'm looking for woad leaves", 'Not right now thanks'],
            true
        );

        if (choice === 0) {
            await npc.say(
                'Well luckily for you I may have some around here somewhere'
            );

            await player.say('Can I buy one please?');
            await howMuch(player, npc);
        }
    } else {
        await npc.say('Hey i have heard you are looking for woad leaves');

        const choice = await player.ask(
            ['Well yes I am. Can you get some?', 'Who told you that?'],
            true
        );

        switch (choice) {
            case 0: // yes
                await npc.say('Yes I have some somewhere');

                await player.say(
                    'Can I buy one please?',
                    'Can I buy one please?'
                );

                await howMuch(player, npc);
                break;
            // who told you
            case 1: {
                await npc.say(
                    "I can't remember now. Someone who visits this park",
                    'I happen to have some woad leaves lying around',
                    'Would you like to buy some?'
                );

                const choice = await player.ask(
                    ['Oh yes please', 'No thanks not right now'],
                    true
                );

                if (choice === 0) {
                    await howMuch(player, npc);
                }
                break;
            }
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
