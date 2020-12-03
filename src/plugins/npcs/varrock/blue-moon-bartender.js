// https://classic.runescape.wiki/w/Transcript:Bartender#Bartender_(Blue_Moon_Inn)

const {
    shouldHandleBar,
    blueMoonBarcrawl
} = require('../../miniquests/barcrawl');

const BARTENDER_ID = 12;
const BEER_ID = 193;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARTENDER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('What can I do yer for?');

    const choices = [
        'A glass of your finest ale please',
        'Can you recommend anywhere an adventurer might make his fortune?',
        'Do you know where I can get some good equipment?'
    ];

    if (shouldHandleBar(player, 'blueMoon')) {
        choices.push("I'm doing Alfred Grimhand's barcrawl");
    }

    const choice = await player.ask(choices, true);

    switch (choice) {
        case 0: // glass of ale
            await npc.say('No problemo', "That'll be 2 coins");

            if (player.inventory.has(10, 2)) {
                player.inventory.remove(10, 2);
                player.inventory.add(BEER_ID);
                player.message('You buy a pint of beer');
            } else {
                await player.say("Oh dear. I don't seem to have enough money");
            }
            break;
        // fortune
        case 1: {
            await npc.say(
                "Ooh I don't know if I should be giving away information",
                'Makes the computer game too easy'
            );

            const choice = await player.ask([
                'Oh ah well',
                'Computer game? What are you talking about?',
                'Just a small clue?'
            ]);

            switch (choice) {
                case 0: // oh well
                    await player.say('Oh ah well');
                    break;
                case 1: // computer game
                    await player.say(
                        'Computer game?',
                        'What are you talking about?'
                    );
                    await npc.say(
                        'This world around us..',
                        'is all a computer game..',
                        'called Runescape'
                    );
                    await player.say(
                        "Nope, still don't understand what you are talking " +
                            'about',
                        "What's a computer?"
                    );
                    await npc.say(
                        "It's a sort of magic box thing,",
                        'which can do all sorts of different things'
                    );
                    await player.say(
                        'I give up',
                        "You're obviously completely mad"
                    );
                    break;
                case 2: // clue
                    await player.say('Just a small clue?');
                    await npc.say(
                        'Go and talk to the bartender at the Jolly Boar Inn',
                        "He doesn't seem to mind giving away clues"
                    );
                    break;
            }

            break;
        }
        case 2: // equipment
            await npc.say(
                "Well, there's the sword shop across the road,",
                "or there's also all sorts of shops up around the market"
            );
            break;
        case 3: // barcrawl
            await blueMoonBarcrawl(player, npc);
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
