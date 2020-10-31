// https://classic.runescape.wiki/w/Transcript:Bartender#Bartender_(Jolly_Boar_Inn)

const {
    shouldHandleBar,
    jollyBoarBarcrawl
} = require('../../miniquests/barcrawl');

const BARTENDER_ID = 44;
const BEER_ID = 193;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARTENDER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Yes please?');

    const choices = [
        "I'll have a beer please",
        'Any hints where I can go adventuring?',
        'Heard any good gossip?'
    ];

    if (shouldHandleBar(player, 'jollyBoar')) {
        choices.push("I'm doing Alfred Grimhand's barcrawl");
    }

    const choice = await player.ask(choices);

    switch (choice) {
        case 0: // beer
            await player.say("I'll have a pint of beer please");
            await npc.say("Ok, that'll be two coins");

            if (player.inventory.has(10, 2)) {
                player.inventory.remove(10, 2);
                player.inventory.add(BEER_ID);
                player.message('You buy a pint of beer');
            } else {
                await player.say("Oh dear. I don't seem to have enough money");
            }
            break;
        case 1: // adventuring
            await player.say('Any hints on where I can go adventuring?');
            await npc.say(
                "It's funny you should say that",
                'An adventurer passed through here, the other day,',
                'claiming to have found a dungeon full of treasure,',
                'guarded by vicious skeletal warriors',
                'He said he found the entrance in a ruined town',
                'deep in the woods to the west of here, behind the palace',
                'Now how much faith you put in that story is up to you,',
                "but it probably wouldn't do any harm to have a look"
            );
            await player.say('Thanks', 'I may try that at some point');
            break;
        case 2: // gossip
            await player.say('Heard any good gossip?');
            await npc.say(
                "I've heard that the bartender in the Blue Moon Inn has gone " +
                    'a little crazy',
                'He keeps claiming he is part of something called a computer ' +
                    'game',
                "What that means, I don't know",
                "That's probably old news by now though"
            );
            break;
        case 3: // barcrawl
            await player.say("I'm doing Alfred Grimhand's barcrawl");
            await jollyBoarBarcrawl(player, npc);
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
