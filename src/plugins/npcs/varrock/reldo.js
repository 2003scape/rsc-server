// https://classic.runescape.wiki/w/Transcript:Reldo

const { initiateQuest } = require('../../quests/free/shield-of-arrav/reldo');
const { knowAboutDwarves } = require('../../quests/free/knights-sword/reldo');

const RELDO_ID = 20;

async function onTalkToNPC(player, npc) {
    if (
        npc.id !== RELDO_ID ||
        player.questStages.shieldOfArrav === 2 ||
        player.questStages.shieldOfArrav === 3
    ) {
        return false;
    }

    const shieldOfArravStage = player.questStages.shieldOfArrav;
    const knightsSwordStage = player.questStages.theKnightsSword;

    player.engage(npc);

    await player.say('Hello');
    await npc.say('Hello stranger');

    const choices = ['Do you have anything to trade?', 'What do you do?'];

    if (!shieldOfArravStage) {
        choices.unshift("I'm in search of a quest");
    }

    if (knightsSwordStage === 1) {
        choices.push('What do you know about the Imcando dwarves?');
    }

    let choice = await player.ask(choices, true);

    if (shieldOfArravStage || shieldOfArravStage === -1) {
        choice += 1;
    }

    switch (choice) {
        case 0: // search of quest
            await initiateQuest(player, npc);
            break;
        case 1: // anything to trade
            await npc.say("No, sorry. I'm not the trading type");
            await player.say('ah well');
            break;
        case 2: // what do you do
            await npc.say("I'm the palace librarian");
            await player.say("Ah that's why you're in the library then");

            await npc.say(
                'Yes',
                "Though I might be in here even if I didn't work here",
                'I like reading'
            );
            break;
        case 3: // know about imcando
            await knowAboutDwarves(player, npc);
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
