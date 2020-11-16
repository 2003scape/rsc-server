// https://classic.runescape.wiki/w/Transcript:Apothecary

const APOTHECARY_ID = 33;
const CADAVA_POTION_ID = 57;
const LIMPWURT_ROOT_ID = 220;
const RED_SPIDER_EGGS_ID = 219;
const SPOT_POTION_ID = 58;
const STRENGTH_POTION_ID = 221;

async function onTalkToNPC(player, npc) {
    const romeoJulietStage = player.questStages.romeoAndJuliet;

    if (
        npc.id !== APOTHECARY_ID ||
        romeoJulietStage === 4 ||
        (romeoJulietStage === 5 &&
            !player.inventory.has(CADAVA_POTION_ID) &&
            !player.bank.has(CADAVA_POTION_ID))
    ) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        'I am the apothecary',
        'I have potions to brew. Do you need anything specific?'
    );

    const choice = await player.ask(
        [
            'Can you make a strength potion?',
            'Do you know a potion to make hair fall out?',
            'Have you got any good potions to give way?'
        ],
        true
    );

    switch (choice) {
        case 0: // strength potion
            if (
                player.inventory.has(RED_SPIDER_EGGS_ID) &&
                player.inventory.has(LIMPWURT_ROOT_ID) &&
                player.inventory.has(10, 5)
            ) {
                await player.say(
                    'I have the root and spiders eggs needed to make it'
                );

                await npc.say(
                    "Well give me them and 5 gold and I'll make you your potion"
                );

                const choice = await player.ask(['Yes ok', 'No thanks'], true);

                if (choice === 0) {
                    const { world } = player;

                    player.inventory.remove(LIMPWURT_ROOT_ID);
                    player.inventory.remove(RED_SPIDER_EGGS_ID);
                    player.inventory.remove(10, 5);

                    player.message(
                        'You give a limpwurt root some red spiders eggs and ' +
                            '5 coins to the apothecary'
                    );

                    await world.sleepTicks(3);

                    player.message('The Apothecary brews you a potion');

                    await world.sleepTicks(6);

                    player.message(
                        'The Apothecary gives you a strength potion'
                    );

                    player.inventory.add(STRENGTH_POTION_ID);
                }
            } else {
                await npc.say(
                    'Yes. But the ingredients are a little hard to find',
                    'If you ever get them I will make it for you. For a cost'
                );

                await player.say('So what are the ingredients?');

                await npc.say(
                    "You'll need to find the eggs of the deadly red spider",
                    'And a limpwurt root',
                    "Oh and you'll have to pay me 5 coins"
                );

                await player.say("Ok, I'll look out for them");
            }
            break;
        case 1: // hair fall out
            await npc.say(
                "I do indeed. I gave it to my mother. That's why I now live " +
                    'alone'
            );
            break;
        case 2: // give way
            if (player.inventory.has(SPOT_POTION_ID)) {
                await npc.say('Only that spot cream. Hope you enjoy it');
            }

            if (!player.inventory.has(SPOT_POTION_ID) && Math.random() <= 0.5) {
                await npc.say('Sorry, charity is not my strong point');
            } else {
                await npc.say('Yes, ok. Try this potion');
                player.inventory.add(SPOT_POTION_ID);
            }
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
