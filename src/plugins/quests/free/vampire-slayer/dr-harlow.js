// https://classic.runescape.wiki/w/Transcript:Dr_Harlow

const BEER_ID = 193;
const DR_HARLOW_ID = 98;
const STAKE_ID = 217;

async function giveBeer(player, npc) {
    if (player.inventory.has(BEER_ID)) {
        player.inventory.remove(BEER_ID);
        player.message('You give a beer to Dr Harlow');
        await npc.say('Cheersh matey');
        return true;
    }

    await player.say("I'll just go buy one");
    return false;
}

async function howToKillVampires(player, npc) {
    await player.say('So tell me how to kill vampires then');
    await npc.say('Yesh yesh vampires I was very good at killing em once');
    player.message('Dr Harlow appears to sober up slightly');

    await npc.say(
        "Well you're gonna to kill it with a stake",
        "Otherwishe he'll just regenerate",
        'Yes your killing blow must be done with a stake',
        'I jusht happen to have one on me'
    );

    player.inventory.add(STAKE_ID);
    player.message('Dr Harlow hands you a stake');

    await npc.say(
        "You'll need a hammer to hand to drive it in properly as well",
        'One last thing',
        "It's wise to carry garlic with you",
        'Vampires are weakened somewhat if they can smell garlic',
        "Dunno where you'd find that though",
        'Remember even then a vampire is a dangeroush foe'
    );

    await player.say('Thank you very much');
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== DR_HARLOW_ID) {
        return false;
    }

    const questStage = player.questStages.vampireSlayer;

    player.engage(npc);

    await npc.say('Buy me a drrink pleassh');

    const choices = ["No you've had enough", 'Ok mate'];

    if (questStage === 1 && !player.inventory.has(STAKE_ID)) {
        choices.push('Morgan needs your help');
    }

    const choice = await player.ask(choices, true);

    switch (choice) {
        case 1: // ok
            await giveBeer(player, npc);
            break;
        // morgan needs help
        case 2: {
            await npc.say('Morgan you shhay?');

            await player.say(
                'His village is being terrorised by a vampire',
                'He wanted me to ask you how i should go about stopping it'
            );

            await npc.say(
                "Buy me a beer then i'll teash you what you need to know"
            );

            const choice = await player.ask(
                [
                    'Ok mate',
                    "But this is your friend Morgan we're talking about"
                ],
                true
            );

            switch (choice) {
                case 0: // ok
                    if (await giveBeer(player, npc)) {
                        await howToKillVampires(player, npc);
                    }
                    break;
                case 1: // but this is morgan
                    await npc.say('Buy ush a drink anyway');
                    break;
            }
            break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
