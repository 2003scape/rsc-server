// https://classic.runescape.wiki/w/Transcript:Thief

const THIEF_ID = 64;

const {
    killingCitizens,
    worriedAboutGoblins,
    howCanIHelp,
    searchOfQuest
} = require('./man');

async function onTalkToNPC(player, npc) {
    if (npc.id !== THIEF_ID) {
        return false;
    }

    player.engage(npc);
    await player.say('Hello', "How's it going?");

    const roll = Math.floor(Math.random() * 14);

    switch (roll) {
        case 0:
            player.message('The man ignores you');
            break;
        case 1:
            await howCanIHelp(player, npc);
            break;
        case 2:
            await npc.say('Are you asking for a fight?');
            await npc.attack(player);
            break;
        case 3:
            await npc.say("I'm fine", 'How are you?');
            await player.say('Very well, thank you');
            break;
        case 4:
            await npc.say('Not too bad');
            break;
        case 5:
            // this is intentional repetition
            await npc.say('Not too bad');
            await worriedAboutGoblins(player, npc);
            break;
        case 6:
            await npc.say("No, I don't have any spare change");
            break;
        case 7:
            await npc.say(
                'I think we need a new king',
                "The one we've got isn't very good"
            );
            break;
        case 8:
            await killingCitizens(npc);
            break;
        case 9:
            await npc.say("No, I don't want to buy anything");
            break;
        case 10:
            await npc.say('That is classified information');
            break;
        case 11:
            await npc.say('Who are you?');
            await player.say('I am a bold adventurer');
            await npc.say('A very noble profession');
            break;
        case 12:
            await npc.say('Get out of my way', "I'm in a hurry");
            break;
        case 13:
            await searchOfQuest(player, npc);
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
