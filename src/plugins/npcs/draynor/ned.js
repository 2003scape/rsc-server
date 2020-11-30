// https://classic.runescape.wiki/w/Transcript:Ned

const {
    otherThingsFromWool
} = require('../../quests/free/prince-ali-rescue/ned');

const { takeMeToCrandor } = require('../../quests/free/dragon-slayer/ned');

const BALL_OF_WOOL_ID = 207;
const NED_ID = 124;
const ROPE_ID = 237;

async function onTalkToNPC(player, npc) {
    if (npc.id !== NED_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        'Why hello there, me friends call me Ned',
        'I was a man of the sea, but its past me now',
        'Could I be making or selling you some Rope?'
    );

    const choices = [
        'Yes, I would like some Rope',
        "No thanks Ned, I don't need any"
    ];

    const dragonSlayerStage = player.questStages.dragonSlayer;
    const nedInShip = player.cache.nedInShip;
    const princeAliRescueStage = player.questStages.princeAliRescue;

    if (dragonSlayerStage === 2 && !nedInShip) {
        choices.unshift(
            "You're a sailor? Could you take me to the Isle of Crandor"
        );
    }

    // confirmed from video that this choice is at the end
    if (princeAliRescueStage === 2 || princeAliRescueStage === 3) {
        choices.push('Ned, could you make other things from wool?');
    }

    let choice = await player.ask(choices, true);

    if (dragonSlayerStage !== 2) {
        choice += 1;
    }

    switch (choice) {
        case 0: // crandor
            await takeMeToCrandor(player, npc);
            break;
        // yes rope
        case 1: {
            await npc.say(
                'Well, I can sell you some rope for 15 coins',
                'Or I can be making you some if you gets me 4 balls of wool',
                'I strands them together I does, makes em strong'
            );

            const choices = [
                'Okay, please sell me some Rope',
                'Thats a little more than I want to pay'
            ];

            let hasWool = false;

            if (player.inventory.has(BALL_OF_WOOL_ID, 4)) {
                choices.push(
                    'I have some balls of wool. could you make me some Rope?'
                );

                hasWool = true;
            } else {
                choices.push('I will go and get some wool');
            }

            const choice = await player.ask(choices, false);

            switch (choice) {
                case 0: // sell me rope
                    if (player.inventory.has(10, 15)) {
                        await player.say('Okay, please sell me some Rope');
                        player.inventory.remove(10, 15);
                        player.message('You hand Ned 15 coins');
                        await npc.say('There you go, finest rope in Runescape');
                        player.inventory.add(ROPE_ID);
                    } else {
                        player.message(
                            "You Don't have enough coins to buy any rope!"
                        );
                    }
                    break;
                case 1: // too much $
                    await player.say('Thats a little more than I want to pay');

                    await npc.say(
                        'Well, if you ever need rope. thats the price. sorry',
                        'An old sailor needs money for a little drop o rum.'
                    );
                    break;
                case 2: // wool
                    if (hasWool) {
                        await player.say(
                            'I have some balls of wool. could you make me ' +
                                'some Rope?'
                        );

                        await npc.say('Sure I can.');

                        player.inventory.remove(BALL_OF_WOOL_ID, 4);
                        player.inventory.add(ROPE_ID);
                    } else {
                        await player.say('I will go and get some wool');

                        await npc.say(
                            'Aye, you do that',
                            'Remember, it takes 4 balls of wool to make ' +
                                'strong rope'
                        );
                    }
                    break;
            }
            break;
        }
        case 2: // no thanks
            await npc.say(
                'Well, old Neddy is always here if you do',
                'Tell your friends, I can always be using the business'
            );
            break;
        case 3: // other things
            await otherThingsFromWool(player, npc);
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
