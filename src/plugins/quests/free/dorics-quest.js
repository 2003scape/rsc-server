// https://classic.runescape.wiki/w/Doric%27s_quest
// https://classic.runescape.wiki/w/Transcript:Doric

const DORIC_ANVIL_ID = 177;
const DORIC_ID = 144;

const ORES = [
    // clay
    { id: 149, amount: 6 },
    // copper
    { id: 150, amount: 4 },
    // iron
    { id: 151, amount: 2 }
];

async function onTalkToNPC(player, npc) {
    if (npc.id !== DORIC_ID) {
        return false;
    }

    const questStage = player.questStages.doricsQuest;

    player.engage(npc);

    if (!questStage) {
        await npc.say('Hello traveller, what brings you to my humble smithy?');

        const choice = await player.ask(
            [
                'I wanted to use your anvils',
                'Mind your own business, shortstuff',
                'I was just checking out the landscape',
                'What do you make here?'
            ],
            true
        );

        switch (choice) {
            // anvils
            case 0: {
                await npc.say(
                    'My anvils get enough work with my own use',
                    'I make amulets, it takes a lot of work.',
                    'If you could get me some more materials I could let you ' +
                        'use them'
                );

                const choice = await player.ask(
                    [
                        'Yes I will get you materials',
                        'No, hitting rocks is for the boring people, sorry.'
                    ],
                    false
                );

                switch (choice) {
                    case 0: // yes
                        await player.say('Yes I will get you materials');

                        await npc.say(
                            'Well, clay is what I use more than anything. I ' +
                                'make casts',
                            'Could you get me 6 clay, and 4 copper ore and 2 ' +
                                'iron ore please?',
                            'I could pay a little, and let you use my anvils'
                        );

                        await player.say(
                            'Certainly, I will get them for you. goodbye'
                        );

                        player.questStages.doricsQuest = 1;
                        break;
                    case 1: // no
                        await player.say(
                            'No, hitting rocks is for the boring people, sorry'
                        );

                        await npc.say(
                            'That is your choice, nice to meet you anyway'
                        );
                        break;
                }
                break;
            }
            case 1: // shortstuff
                await npc.say(
                    'How nice to meet someone with such pleasant manners',
                    'Do come again when you need to shout at someone smaller ' +
                        'than you'
                );
                break;
            case 2: // landscape
                await npc.say(
                    'We have a fine town here, it suits us very well',
                    'Please enjoy your travels. And do visit my friends in ' +
                        'their mine'
                );
                break;
            case 3: // what do you make
                await npc.say(
                    'I make amulets. I am the best maker of them in Runescape'
                );

                await player.say('Do you have any to sell?');
                await npc.say('Not at the moment, sorry. Try again later');
                break;
        }
    } else if (questStage === 1) {
        await npc.say('Have you got my materials yet traveller?');

        let hasOres = true;

        for (const ore of ORES) {
            if (!player.inventory.has(ore)) {
                hasOres = false;
                break;
            }
        }

        if (hasOres) {
            await player.say('I have everything you need');
            await npc.say('Many thanks, pass them here please');

            for (const ore of ORES) {
                player.inventory.remove(ore);
            }

            player.message('@que@You hand the clay, copper and iron to Doric');

            await npc.say('I can spare you some coins for your trouble');

            player.inventory.add(10, 180);
            player.message('@que@Doric hands you 180 coins');

            await npc.say('Please use my anvils any time you want');

            player.message('@que@You have completed Dorics quest');

            player.addExperience(
                'mining',
                player.skills.mining.base * 300 + 700,
                false
            );

            player.questStages.doricsQuest = -1;
            player.addQuestPoints(1);
            player.message('@gre@You haved gained 1 quest point!');
        } else {
            await player.say("Sorry, I don't have them all yet");

            await npc.say(
                'Not to worry, stick at it',
                'Remember I need 6 Clay, 4 Copper ore and 2 Iron ore'
            );
        }
    } else if (questStage === -1) {
        await npc.say(
            'Hello traveller, how is your Metalworking coming along?'
        );

        await player.say('Not too bad thanks Doric');
        await npc.say('Good, the love of metal is a thing close to my heart');
    }

    player.disengage();

    return true;
}

async function onUseWithGameObject(player, gameObject) {
    if (
        gameObject.id !== DORIC_ANVIL_ID ||
        player.questStages.doricsQuest === -1
    ) {
        return false;
    }

    const { world } = player;
    const doric = world.npcs.getByID(DORIC_ID);

    if (!doric || doric.locked || !player.localEntities.known.npcs.has(doric)) {
        player.message("You need to finish Doric's quest to use this anvil");
    } else {
        player.engage(doric);
        await doric.say('Heh who said you could use that?');
        player.disengage();
    }

    return true;
}

module.exports = { onTalkToNPC, onUseWithGameObject };
