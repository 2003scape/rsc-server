// https://classic.runescape.wiki/w/Transcript:Thurgo

const BLURITE_ORE_ID = 266;
const FALADIAN_KNIGHTS_SWORD_ID = 265;
const IRON_BAR_ID = 170;
const PORTRAIT_ID = 264;
const REDBERRY_PIE = 258;
const THURGO_ID = 134;

const SMITHING_MESSAGES = [
    'You give some blurite ore and two iron bars to Thurgo',
    'Thurgo starts making a sword',
    'Thurgo hammers away',
    'Thurgo hammers some more',
    'Thurgo hands you a sword'
];

async function thanksForSword(player, npc) {
    await player.say('Thanks for your help in getting the sword for me');
    await npc.say('No worries mate');
}

async function giveRedberryPie(player, npc) {
    const { world } = player;

    player.message("@que@Thurgo's eyes light up");
    await world.sleepTicks(3);

    await npc.say("I'd never say no to a redberry pie", "It's great stuff");

    player.inventory.remove(REDBERRY_PIE);
    player.message('@que@You hand over the pie');
    await world.sleepTicks(3);

    player.message('@que@Thurgo eats the pie');
    await world.sleepTicks(2);
    player.message('@que@Thurgo pats his stomach');

    await npc.say(
        'By Guthix that was good pie',
        'Anyone who makes pie like that has gotta be alright'
    );

    player.questStages.theKnightsSword = 3;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== THURGO_ID) {
        return false;
    }

    const questStage = player.questStages.theKnightsSword;

    if (!questStage) {
        // different from the default "*The* <npc> doesn't..."
        player.message("Thurgo doesn't appear to be interested in talking");
        return true;
    }

    player.engage(npc);

    if (
        questStage === 1 ||
        (questStage === 2 && !player.inventory.has(REDBERRY_PIE))
    ) {
        await player.say('Hello are you are an Imcando Dwarf?');
        await npc.say('Yeah what about it?');
    } else if (questStage === 2) {
        const choice = await player.ask(
            [
                'Hello are you are an Imcando Dwarf?',
                'Would you like some redberry pie?'
            ],
            true
        );

        switch (choice) {
            // are you imcando
            case 0: {
                await npc.say('Yeah what about it?');

                const choice = await player.ask(
                    [
                        'Would you like some redberry  Pie?',
                        'Can you make me a special sword?'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // want pie
                        await giveRedberryPie(player, npc);
                        break;
                    case 1: // make me a sword
                        await npc.say(
                            "no I don't do that anymore",
                            "I'm getting old"
                        );
                        break;
                }
                break;
            }
            case 1: // want pie
                await giveRedberryPie(player, npc);
                break;
        }
    } else if (questStage === 3) {
        await player.say('Can you make me a special sword?');

        await npc.say(
            "Well after you've brought me such a great pie",
            'I guess I should give it a go',
            'What sort of sword is it?'
        );

        await player.say(
            'I need you to make a sword for one of Falador',
            'He had one which was passed down through five',
            'But his squire has lost it',
            'So we need an identical one to replace it'
        );

        await npc.say(
            "A Knight's sword eh?",
            "Well I'd need to know exactly how it looked",
            'Before I could make a new one',
            'All the Faladian knights used to have swords with different ' +
                'designs',
            'could you bring me a picture or something?'
        );

        await player.say(
            "I'll see if I can find one",
            "I'll go and ask his squire"
        );

        player.questStages.theKnightsSword = 4;
    } else if (questStage === 4) {
        if (player.inventory.has(PORTRAIT_ID)) {
            const { world } = player;

            await player.say(
                'I have found a picture of the sword I would like you to make'
            );

            player.inventory.remove(PORTRAIT_ID);
            player.message('@que@You give the portrait to Thurgo');
            await world.sleepTicks(3);

            player.message('@que@Thurgo studies the portrait');
            await world.sleepTicks(3);

            await npc.say(
                "Ok you'll need to get me some stuff for me to make this",
                "I'll need two Iron bars to make the sword to start with",
                "I'll also need an ore called blurite",
                "It's useless for making actual weapons for fighting with",
                "But I'll need some as decoration for the hilt",
                'It is a fairly rare sort of ore',
                'The only place I know where to get it',
                'Is under this cliff here',
                'But it is guarded by a very powerful ice giant',
                'Most the rocks in that clif are pretty useless',
                "Don't contain much of anything",
                "But there's definitly some blurite in there",
                "You'll need a little bit of mining experience",
                'TO be able to find it'
            );

            await player.say("Ok I'll go and find them");

            player.questStages.theKnightsSword = 5;
        } else {
            await npc.say('Have you got a picture of the sword for me yet?');
            await player.say('Sorry not yet');
        }
    } else if (questStage === 5) {
        if (player.inventory.has(FALADIAN_KNIGHTS_SWORD_ID)) {
            await thanksForSword(player, npc);
        } else {
            await npc.say('How are you doing finding sword materials?');

            if (
                player.inventory.has(BLURITE_ORE_ID) &&
                player.inventory.has(IRON_BAR_ID, 2)
            ) {
                const { world } = player;

                await player.say('I have them all');

                player.inventory.remove(BLURITE_ORE_ID);
                player.inventory.remove(IRON_BAR_ID, 2);

                for (const message of SMITHING_MESSAGES) {
                    player.message(`@que@${message}`);
                    await world.sleepTicks(3);
                }

                player.inventory.add(FALADIAN_KNIGHTS_SWORD_ID);
                await player.say('Thank you very much');

                await npc.say(
                    'Just remember to call in with more pie some time'
                );
            } else {
                await player.say("I haven't found everything yet");

                await npc.say(
                    'Well come back when you do',
                    'Remember I need blurite ore and two iron bars'
                );
            }
        }
    } else if (questStage === -1) {
        await thanksForSword(player, npc);
    }

    player.disengage(npc);
    return true;
}

module.exports = { onTalkToNPC };
