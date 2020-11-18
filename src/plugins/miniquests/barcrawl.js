// https://classic.runescape.wiki/w/Alfred_Grimhand_Bar_Crawl

const BARCRAWL_CARD_ID = 668;

// have we started barcrawl, but haven't completed this part yet?
function shouldHandleBar(player, barName) {
    return (
        player.inventory.has(BARCRAWL_CARD_ID) &&
        player.cache.barcrawl &&
        !player.cache.barcrawl[barName]
    );
}

async function blueMoonBarcrawl(player, npc) {
    const { world, cache } = player;

    await npc.say(
        'Oh no not another of you guys',
        'These barbarian barcrawls cause too much damage to my bar',
        "You're going to have to pay 50 gold for the Uncle Humphrey's gutrot"
    );

    if (player.inventory.has(10, 50)) {
        player.inventory.remove(10, 50);
        player.message('You buy some gutrot');
        await world.sleepTicks(2);
        player.message('You drink the gutrot');
        await world.sleepTicks(2);
        player.message('your insides feel terrible');
        await world.sleepTicks(2);
        player.message('The bartender signs your card');
        await player.say('Blearrgh');
        cache.barcrawl.blueMoon = true;
    } else {
        await player.say("I don't have 50 coins");
    }
}

async function jollyBoarBarcrawl(player, npc) {
    const { world, cache } = player;

    await npc.say(
        'Ah, there seems to be a fair few doing that one these days',
        'My supply of Olde Suspiciouse is starting to run low',
        "It'll cost you 10 coins"
    );

    if (player.inventory.has(10, 10)) {
        player.inventory.remove(10, 10);
        player.message('You buy a pint of Olde Suspiciouse');
        await world.sleepTicks(2);
        player.message('You gulp it down');
        await world.sleepTicks(2);
        player.message('Your head is spinning');
        await world.sleepTicks(2);
        player.message('The bartender signs your card');
        await player.say('Thanksh very mush');
        cache.barcrawl.jollyBoar = true;
    } else {
        await player.say("I don't have 10 coins right now");
    }
}

async function foresterArmsBarcrawl(player, npc) {
    const { world, cache } = player;

    await npc.say(
        "Oh you're a barbarian then",
        'Now which of these was the barrels contained the liverbane ale?',
        "That'll be 18 coins please"
    );

    if (player.inventory.has(10, 18)) {
        player.inventory.remove(10, 18);
        player.message('The bartender gives you a glass of liverbane ale');
        await world.sleepTicks(2);
        player.message('You gulp it down');
        await world.sleepTicks(2);
        player.message('The room seems to be swaying');
        await world.sleepTicks(2);
        // "signiture" sic
        player.message('The bartender scrawls his signiture on your card');
        cache.barcrawl.foresterArms = true;
    } else {
        await player.say("Sorry I don't have 18 coins");
    }
}

async function rustyAnchorBarcrawl(player, npc) {
    const { world, cache } = player;

    await npc.say('Are you sure you look a bit skinny for that');
    await player.say('Just give me whatever drink I need to drink here');
    await npc.say('Ok one black skull ale coming up, 8 coins please');

    if (player.inventory.has(10, 8)) {
        player.inventory.remove(10, 8);
        player.message('You buy a black skull ale');
        await world.sleepTicks(2);
        player.message('You drink your black skull ale');
        await world.sleepTicks(2);
        player.message('Your vision blurs');
        await world.sleepTicks(2);
        player.message('The bartender signs your card');
        cache.barcrawl.rustyAnchor = true;
    } else {
        await player.say("I don't have 8 coins with me");
    }
}

async function risingSunBarcrawl(player, npc) {
    const { world, cache } = player;

    await npc.say(
        "Hehe this'll be fun",
        "You'll be after our off the menu hand of death cocktail then",
        'Lots of expensive parts to the cocktail though',
        'So it will cost you 70 coins'
    );

    if (player.inventory.has(10, 70)) {
        player.inventory.remove(10, 70);
        player.message('You buy a hand of death cocktail');
        await world.sleepTicks(2);
        player.message('You drink the cocktail');
        await world.sleepTicks(2);
        player.message('You stumble around the room');
        await world.sleepTicks(2);
        player.message('The barmaid giggles');
        await world.sleepTicks(2);
        player.message('The barmaid signs your card');
        cache.barcrawl.risingSun = true;
    } else {
        await player.say("I don't have that much money on me");
    }
}

module.exports = {
    shouldHandleBar,
    blueMoonBarcrawl,
    jollyBoarBarcrawl,
    foresterArmsBarcrawl,
    rustyAnchorBarcrawl,
    risingSunBarcrawl
};
