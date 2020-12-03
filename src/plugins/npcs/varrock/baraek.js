// https://classic.runescape.wiki/w/Transcript:Baraek

const { whereIsPhoenix } = require('../../quests/free/shield-of-arrav/baraek');

const BARAEK_ID = 26;
const FUR_ID = 146;
const GREY_WOLF_FUR_ID = 541;

async function eighteenCoins(player, npc) {
    await npc.say("Well, okay I'll go down to 18");

    const choice = await player.ask(
        ['Okay here you go', "No thanks I'll leave it"],
        false
    );

    switch (choice) {
        case 0: // ok
            if (player.inventory.has(10, 18)) {
                await player.say('Okay here you go');
                player.inventory.remove(10, 18);
                player.inventory.add(FUR_ID);
                player.message('You buy a fur from Baraek');
            }
            break;
        case 1: // no thanks
            await player.say("No thanks, I'll leave it");
            await npc.say("It's your loss mate");
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARAEK_ID) {
        return false;
    }

    const { world } = player;
    const phoenixStage = player.cache.phoenixStage || 0;
    const shieldOfArravStage = player.questStages.shieldOfArrav;

    player.engage(npc);

    const choices = [
        'Can you sell me some furs?',
        'Hello I am in search of a quest'
    ];

    if (shieldOfArravStage === 3 && phoenixStage !== -1 && phoenixStage < 2) {
        choices.unshift('Can you tell me where I can find the phoenix gang?');
    }

    let hasFur = false;
    let hasWolfFur = false;

    if (player.inventory.has(FUR_ID)) {
        choices.push('Would you like to buy my fur?');
        hasFur = true;
    }

    if (player.inventory.has(GREY_WOLF_FUR_ID)) {
        choices.push('Would you like to buy my grey wolf fur?');
        hasWolfFur = true;
    }

    let choice = await player.ask(choices, true);

    if (shieldOfArravStage !== 3 || phoenixStage === -1 || phoenixStage > 2) {
        choice += 1;
    }

    if (!hasFur && hasWolfFur) {
        choice = 4;
    }

    switch (choice) {
        case 0: // where i can find the phoenix gang
            await whereIsPhoenix(player, npc);
            break;
        // sell me furs
        case 1: {
            await npc.say("Yeah sure they're 20 gold coins a piece");

            const choice = await player.ask(
                ['Yeah, okay here you go', '20 gold coins thats an outrage'],
                false
            );

            switch (choice) {
                case 0: // yeah
                    if (player.inventory.has(10, 20)) {
                        await player.say('Yeah okay here you go');
                        player.message('You buy a fur from Baraek');
                        player.inventory.remove(10, 20);
                        player.inventory.add(FUR_ID);
                    } else {
                        await player.say(
                            "Oh dear I don't seem to have enough money"
                        );

                        await eighteenCoins(player, npc);
                    }
                    break;
                case 1: // outrage
                    await player.say("20 gold coins that's an outrage");
                    await eighteenCoins(player, npc);
                    break;
            }
            break;
        }
        case 2: // quest
            await npc.say(
                "Sorry kiddo, I'm a fur trader not a damsel in distress"
            );
            break;
        // buy my fur
        case 3: {
            await npc.say('Lets have a look at it');
            player.message('Baraek examines the fur');
            await world.sleepTicks(3);

            await npc.say(
                "It's not in the best of condition",
                'I guess I could give 12 coins to take it off your hands'
            );

            const choice = await player.ask(
                ["Yeah that'll do", "I think I'll keep hold of it actually"],
                true
            );

            switch (choice) {
                case 0: // yeah
                    player.message('You give Baraek a fur');
                    player.inventory.remove(FUR_ID);
                    await world.sleepTicks(2);

                    player.message('And he gives you twelve coins');
                    player.inventory.add(10, 12);
                    await world.sleepTicks(2);
                    break;
                case 1: // no
                    await npc.say('Oh ok', "Didn't want it anyway");
                    break;
            }
            break;
        }
        // buy my wolf fur
        case 4: {
            await npc.say(
                "Grey wolf fur, now you're talking",
                "Hmm I'll give you 120 per fur, does that sound fair?"
            );

            const choice = await player.ask(
                [
                    'Yep sounds fine',
                    'No I almost got my throat torn out by a wolf to get this'
                ],
                true
            );

            if (choice === 0) {
                // > When selling grey wolf furs, the whole inventory of wolf
                // > furs is sold. When selling regular however, they must be
                // > sold one by one, making it impractical.

                while (player.inventory.has(GREY_WOLF_FUR_ID)) {
                    player.inventory.remove(GREY_WOLF_FUR_ID);
                    player.inventory.add(10, 120);
                }
            }
            break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
