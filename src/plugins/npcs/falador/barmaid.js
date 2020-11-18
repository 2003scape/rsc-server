// https://classic.runescape.wiki/w/Transcript:Barmaid

const {
    shouldHandleBar,
    risingSunBarcrawl
} = require('../../miniquests/barcrawl');

const ASGARNIAN_ALE_ID = 267;
const BARMAID_ID = 142;
const DWARVEN_STOUT_ID = 269;
const MIND_BOMB_ID = 268;

async function handleCoins(player, amount) {
    if (player.inventory.has(10, amount)) {
        player.inventory.remove(10, amount);
        return true;
    }

    await player.say("Oh dear. I don't seem to have enough money");
    return false;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARMAID_ID) {
        return false;
    }

    player.engage(npc);

    await player.say('Hi, what ales are you serving?');

    await npc.say(
        'Well you can either have a nice Asgarnian Ale or a Wizards Mind bomb',
        'Or a Dwarven Stout'
    );

    const choices = [
        'One Asgarnian Ale please',
        "I'll try the mind bomb",
        'Can I have a Dwarven Stout?',
        "I don't feel like any of those"
    ];

    if (shouldHandleBar(player, 'risingSun')) {
        choices.push("I'm doing Alfred Grimhand's barcrawl");
    }

    const choice = await player.ask(choices, true);

    switch (choice) {
        case 0: // asgarnian ale
            await npc.say("That'll be two gold");

            if (await handleCoins(player, 2)) {
                player.inventory.add(ASGARNIAN_ALE_ID);
                player.message('You buy an Asgarnian Ale');
            }
            break;
        case 1: // mind bomb
            await npc.say("That'll be two gold");

            if (await handleCoins(player, 2)) {
                player.inventory.add(MIND_BOMB_ID);
                player.message("You buy a pint of Wizard's Mind Bomb");
            }
            break;
        case 2: // dwarven stout
            await npc.say("That'll be three gold");

            if (await handleCoins(player, 3)) {
                player.inventory.add(DWARVEN_STOUT_ID);
                player.message('You buy a pint of Dwarven Stout');
            }
            break;
        case 4: // barcrawl
            await risingSunBarcrawl(player. npc);
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
