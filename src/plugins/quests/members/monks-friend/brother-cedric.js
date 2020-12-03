const CEDRIC_ID = 357;

const LOGS_ID = 14;
const WATER_ID = 50;

async function askForWood(player, cedric) {
    await cedric.say('i need some wood');

    if (!player.inventory.has(LOGS_ID)) {
        return;
    }

    await player.say('here you go..');
    player.inventory.remove(LOGS_ID);
    await player.say("I've got some wood");

    await cedric.say(
        "well done, now i'll fix this cart",
        'you head back to Brother Omad',
        "Tell him i'm on my way",
        "I won't be long"
    );

    player.questStages.monksFriend = 6;
}

async function preCedricStages(player, cedric) {
    await player.say('Hello');
    await cedric.say('honey,money,woman,wine..');
    await player.say('Are you ok?');
    await cedric.say(' yesshh...hic up...beautiful..'); // sic
    await player.say('take care old monk');
    await cedric.say('la..di..da..hic..up..');
    player.message('@que@The monk has had too much to drink');
}

async function lookForWaterStages(player, cedric) {
    const questStage = player.questStages.monksFriend;

    if (questStage === 3) {
        // First talking to him after agreeing to help Omad find him
        await player.say('Brother Cedric are you okay?');
        await cedric.say("yeesshhh, i'm very, very....", '..drunk..hic..up..');
        await player.say('brother Omad needs the wine..', '..for the party');
        await cedric.say(
            ' oh dear, oh dear ',
            'I knew I had to do something',
            'pleashhh, find me some water',
            "once i'm sober i'll help you..",
            '..take the wine back.'
        );

        player.questStages.monksFriend = 4;
    } else if (questStage === 4) {
        // Talking to him again
        await player.say('Are you okay?');
        await cedric.say('...hic up..oh my head..', '..I need some water.');
    }
}

async function goGetWoodStage(player, cedric) {
    await player.say('Hello Cedric');
    await cedric.say('want to help me fix the cart?');

    const choice = await player.ask(
        ["Yes i'd be happy to", 'No, not really'],
        true
    );

    if (choice === 0) {
        await askForWood(player, cedric);
    }
}

async function goBackToOmadStage(player, cedric) {
    await player.say('Hello Cedric');
    await cedric.say(
        "hi, i'm almost done here",
        'go tell Omad that I..',
        "..won't be long"
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== CEDRIC_ID) {
        return false;
    }

    const questStage = player.questStages.monksFriend;

    player.engage(npc);

    if (!questStage || (questStage >= 0 && questStage < 3)) {
        await preCedricStages(player, npc);
    } else if (questStage === 3 || questStage === 4) {
        await lookForWaterStages(player, npc);
    } else if (questStage === 5) {
        await goGetWoodStage(player, npc);
    } else if (questStage === 6) {
        await goBackToOmadStage(player, npc);
    } else {
        await npc.say(
            'Brother Oman sends you his thanks', // sic
            "He won't be in a fit state to thank you in person any more"
        );
    }

    player.disengage(npc);
    return true;
}

async function onUseWithNPC(player, npc, item) {
    if (
        npc.id !== CEDRIC_ID ||
        item.id !== WATER_ID ||
        player.questStages.monksFriend !== 4
    ) {
        // Does anything special happen if you use water on him before stage 4?
        return false;
    }

    const { world } = player;

    player.engage(npc);

    await player.sendBubble(WATER_ID);
    await world.sleepTicks(2);

    await player.say('Cedric, here, drink some water');
    player.inventory.remove(item);
    await npc.say("oh yes, my head's starting to spin", 'gulp...gulp');
    await world.sleepTicks(2);

    player.message('@que@Brother Cedric drinks the water');
    await npc.say("aah, that's better");
    await world.sleepTicks(2);

    player.message('@que@you throw the excess water over brother Cedric');
    await world.sleepTicks(2);

    await npc.say(
        'now i just need to fix...',
        '..this cart..',
        '..and we can go party',
        '.could you help?'
    );

    player.questStages.monksFriend = 5;

    const choice = await player.ask(
        ["No, i've helped enough monks today", "Yes i'd be happy to"],
        true
    );

    if (choice === 0) {
        await npc.say(
            "in that case i'd better drink..",
            "..more wine. It help's me think."
        );
    } else if (choice === 1) {
        await askForWood(player, npc);
    }

    player.disengage(npc);

    return true;
}

module.exports = { onTalkToNPC, onUseWithNPC };
