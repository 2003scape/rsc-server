// https://classic.runescape.wiki/w/Transcript:Aggie#During_Prince_Ali_Rescue

const ASHES_ID = 181;
const FLOUR_ID = 136;
const JUG_OF_WATER_ID = 141;
const REDBERRIES_ID = 236;
const WATER_ID = 50;
const PASTE_ID = 240;

async function skinPaste(player, npc) {
    let waterID = -1;

    if (player.inventory.has(WATER_ID)) {
        waterID = 50;
    } else if (player.inventory.has(JUG_OF_WATER_ID)) {
        waterID = 141;
    }

    let hasIngredients =
        waterID !== -1 &&
        player.inventory.has(ASHES_ID) &&
        player.inventory.has(FLOUR_ID) &&
        player.inventory.has(REDBERRIES_ID);

    if (hasIngredients) {
        const { world } = player;

        await npc.say(
            'Yes I can, you have the ingredients for it already',
            'Would you like me to mix you some?'
        );

        const choice = await player.ask(
            [
                'Yes please, mix me some skin paste',
                "No thankyou, I don't need paste"
            ],
            false
        );

        switch (choice) {
            case 0: // yes
                await player.say('Yes please, mix me some skin paste');

                await npc.say(
                    'That should be simple, hand the things to Aggie then'
                );

                player.inventory.remove(ASHES_ID);
                player.inventory.remove(FLOUR_ID);
                player.inventory.remove(REDBERRIES_ID);
                player.inventory.remove(waterID);

                player.message(
                    '@que@You hand ash, flour, water, and redberries to Aggie'
                );

                await world.sleepTicks(3);

                player.message(
                    '@que@She tips it into a cauldron and mutters some words'
                );

                await world.sleepTicks(3);

                // these are all real british words
                await npc.say(
                    'Tourniquet, Fenderbaum, Tottenham, MonsterMunch, ' +
                        'MarbleArch'
                );

                player.inventory.add(PASTE_ID);
                player.message('@que@Aggie hands you the skin paste');

                await npc.say(
                    'There you go dearie, your skin potion',
                    'That will make you look good at the Varrock dances'
                );
                break;
            case 1: // no
                await player.say("No thank you, I don't need skin paste");
                await npc.say('Okay dearie, thats always your choice');
                break;
        }
    } else {
        await npc.say(
            'Why, its one of my most popular potions',
            'The women here, they like to have smooth looking skin',
            '(and I must admit, some of the men buy it too)',
            'I can make it for you, just get me what needed'
        );

        await player.say('What do you need to make it?');

        await npc.say(
            'Well deary, you need a base for the paste',
            "That's a mix of ash, flour and water",
            'Then you need red berries to colour it as you want',
            'bring me those four items and I will make you some'
        );
    }
}

module.exports = { skinPaste };
