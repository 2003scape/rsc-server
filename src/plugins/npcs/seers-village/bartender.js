// https://classic.runescape.wiki/w/Transcript:Bartender#Bartender_(Forester's_Arms)

const {
    shouldHandleBar,
    foresterArmsBarcrawl
} = require('../../miniquests/barcrawl');

const BARTENDER_ID = 306;
const BEER_ID = 193;
const PIE_ID = 259;
const STEW_ID = 346;

// check if the player has amount of coins and remove them. if not, say a
// message.
async function handleCoins(player, amount) {
    if (player.inventory.has(10, amount)) {
        player.inventory.remove(10, amount);
        return true;
    }

    await player.say("Oh dear. I don't seem to have enough money");
    return false;
}

async function beerPlease(player, npc) {
    await npc.say('one beer coming up', "Ok, that'll be two coins");

    if (await handleCoins(player, 2)) {
        player.inventory.add(BEER_ID);
        await player.sendInventory();
        player.message('You buy a pint of beer');
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARTENDER_ID) {
        return false;
    }

    await npc.say('Good morning, what would you like?');

    const choices = [
        'What do you have?',
        'Beer please',
        "I don't really want anything thanks"
    ];

    let handleBarcrawl = false;

    if (shouldHandleBar(player, 'foresterArms')) {
        choices.splice(2, 0, "I'm doing Alfred Grimhand's barcrawl");
        handleBarcrawl = true;
    }

    const choice = await player.ask(choices, true);

    if (choice === 0) {
        await npc.say(
            'Well we have beer',
            'Or if you want some food, we have our home made stew and ' +
                'meat pies'
        );

        const choice = await player.ask(
            [
                'Beer please',
                "I'll try the meat pie",
                'Could I have some stew please',
                "I don't really want anything thanks"
            ],
            true
        );

        switch (choice) {
            case 0: // beer
                await beerPlease(player, npc);
                break;
            case 1: // meat pie
                await npc.say("Ok, that'll be 16 gold");

                if (await handleCoins(player, 16)) {
                    player.inventory.add(PIE_ID);
                    player.message('You buy a nice hot meat pie');
                }
                break;
            case 2: // stew
                await npc.say("Ok, that'll be 16 gold");

                if (await handleCoins(player, 16)) {
                    player.inventory.add(STEW_ID);
                    player.message('You buy a bowl of home made stew');
                }
                break;
            case 3: // nothing
                break;
        }
    } else if (choice === 1) {
        await beerPlease();
    } else if (handleBarcrawl && choice === 2) {
        await foresterArmsBarcrawl(player, npc);
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
