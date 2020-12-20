const SANFEW_ID = 205;

const ENCHANTED_IDS = {
    bear: 505,
    beef: 507,
    chicken: 508,
    rat: 506
};

async function cauldronDialogue(player, sanfew) {
    await sanfew.say(
        'I need the raw meat from 4 different animals',
        'Which all need to be dipped in the cauldron of thunder'
    );

    const choice = await player.ask(
        ['Where can I find this cauldron?', "Ok I'll do that then"],
        false
    );

    switch (choice) {
        case 0: // where is this cauldron?
            await player.say('Where can I find this cauldron'); // sic
            await sanfew.say(
                'It is in the mysterious underground halls',
                'which are somewhere in the woods to the south of here'
            );
            break;
        case 1: // i'll go do that
            await player.say("Ok I'll do that then");
            break;
    }
}

async function preQuest(player, sanfew) {
    await sanfew.say("What can I do for you young 'un?");

    const choice = await player.ask(
        [
            "I've heard you druids might be able to teach me herblaw",
            "Actually I don't need to speak to you"
        ],
        true
    );

    switch (choice) {
        case 0: // heard you druids can teach me herblaw
            await sanfew.say(
                'You should go to speak to kaqemeex',
                'He is probably our best teacher of herblaw at the moment',
                'I believe he is at our stone circle to the north of here'
            );
            break;
        case 1: // don't need to speak to you
            player.message('Sanfew grunts');
            break;
    }
}

async function goGetEnchantedMeat(player, sanfew) {
    await sanfew.say("What can I do for you young 'un?");

    const choice = await player.ask(
        [
            "I've been sent to help purify the varrock stone circle",
            "Actually I don't need to speak to you"
        ],
        true
    );

    switch (choice) {
        case 0: // helping purify varrock stone circle
            await sanfew.say(
                "Well what I'm struggling with",
                'Is the meats I needed for the sacrifice to Guthix'
            );

            await cauldronDialogue(player, sanfew);
            player.questStages.druidicRitual = 2;
            break;
        case 1: // don't need to speak to you
            player.message('Sanfew grunts');
            break;
    }
}

async function doYouHaveEnchantedMeat(player, sanfew) {
    const enchantedIDs = Object.values(ENCHANTED_IDS);
    const hasEnchantedMeats = enchantedIDs.every((eMeat) =>
        player.inventory.has(eMeat)
    );

    await sanfew.say('Have you got what I need yet?');

    if (hasEnchantedMeats) {
        await player.say('Yes I have everything');

        player.message('You give the meats to Sanfew');
        enchantedIDs.forEach((eMeatID) => player.inventory.remove(eMeatID));

        await sanfew.say(
            'thank you, that has brought us much closer to reclaiming our' +
                'stone circle',
            'Now go and talk to kaqemeex',
            'He will show you what you need to know about herblaw'
        );

        player.questStages.druidicRitual = 3;
    } else {
        await player.say('no not yet');

        const choice = await player.ask(
            ['What was I meant to be doing again?', "I'll get on with it"],
            true
        );

        if (choice === 0) {
            // what am I supposed to be doing?
            await cauldronDialogue(player, sanfew);
        }
    }
}

async function enchantedMeatGiven(player, sanfew) {
    await sanfew.say("What can I do for you young 'un?");

    const choice = await player.ask(
        [
            'Have you any more work for me, to help reclaim the circle?',
            "Actually I don't need to speak to you"
        ],
        true
    );

    switch (choice) {
        case 0: // anything else I can do?
            await sanfew.say(
                'Not at the moment',
                'I need to make some more preparations myself now'
            );
            break;
        case 1: // don't need to speak to you
            player.message('Sanfew grunts');
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== SANFEW_ID) {
        return false;
    }

    const questStage = player.questStages.druidicRitual;

    player.engage(npc);

    if (!questStage) {
        await preQuest(player, npc);
    } else if (questStage === 1) {
        await goGetEnchantedMeat(player, npc);
    } else if (questStage === 2) {
        await doYouHaveEnchantedMeat(player, npc);
    } else {
        await enchantedMeatGiven(player, npc);
    }

    player.disengage(npc);
    return true;
}

module.exports = { ENCHANTED_IDS, onTalkToNPC };
