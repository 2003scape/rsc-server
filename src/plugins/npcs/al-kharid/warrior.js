// https://classic.runescape.wiki/w/Transcript:Warrior

const {
    wishToTrade,
    searchOfQuest,
    enemiesToKill,
    howCanIHelp,
    inAHurry,
    imFine,
    askingForFight,
    niceWeather,
    worriedAboutGoblins
} = require('../man');

const WARRIOR_ID = 86;
const FLIER_ID = 201;

async function onTalkToNPC(player, npc) {
    if (npc.id !== WARRIOR_ID) {
        return false;
    }

    player.engage(npc);

    await player.say('Hello', "How's it going?");

    const roll = Math.floor(Math.random() * 17);

    switch (roll) {
        case 0:
            await npc.say('Do I know you?');
            await player.say(
                'No, I was just wondering if you had anything interesting to ' +
                    'say'
            );
            break;
        case 1:
            await npc.say("No, I don't have any spare change");
            break;
        case 2:
            await howCanIHelp(player, npc);
            break;
        case 3:
            await wishToTrade(player, npc);
            break;
        case 4:
            await searchOfQuest(player, npc);
            break;
        case 5:
            await enemiesToKill(player, npc);
            break;
        case 6:
            await npc.say('Not too bad');
            break;
        case 7:
            await npc.say('None of your business');
            break;
        case 8:
            await inAHurry(npc);
            break;
        case 9:
            await imFine(player, npc);
            break;
        case 10:
            await askingForFight(player, npc);
            return true;
        case 11:
            await npc.say('Hello');
            break;
        case 12:
            await niceWeather(npc);
            break;
        case 13:
            player.message('The man ignores you');
            break;
        case 14:
            await npc.say('Have this flier');
            player.inventory.add(FLIER_ID);
            break;
        case 15:
            await worriedAboutGoblins(player, npc);
            break;
        case 16:
            await npc.say("No I don't want to buy anything");
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
