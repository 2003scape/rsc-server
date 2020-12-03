const OMAD_ID = 350;

const BLANKET_ID = 716;
const LAW_RUNE_ID = 42;

async function initiateQuest(player, omad) {
    await player.say('can I help at all?'); // different capitalization

    await omad.say(
        'please do, we are peaceful men',
        ' but you could recover the blanket from the thieves' // sic
    );

    await player.say('where are they?');

    await omad.say(
        'they hide in a secret cave in the forest',
        "..it's hidden under a ring of stones",
        'please, bring back the blanket'
    );

    player.questStages.monksFriend = 1;
}

async function preQuestStart(player, npc) {
    await player.say('hello there');

    await npc.say(
        ' ...yawn...oh, hello...yawn..',
        "I'm sorry, I'm just so tired..",
        "I haven't slept in a week",
        "It's driving me mad"
    );

    const choice = await player.ask(
        [
            "Why can't you sleep, what's wrong?",
            "sorry, i'm too busy to hear your problems"
        ],
        false
    );

    switch (choice) {
        case 0: // why can't you sleep?
            await player.say("Why can't you sleep, what's wrong?");

            await npc.say(
                "It's the brother Androe's son",
                'with his constant waaaaaah..waaaaaaaaah',
                " Androe said it's natural, but it's just annoying" // sic
            );

            await player.say("I suppose that's what kids do");

            await npc.say(
                'he was fine, up until last week',
                'thieves broke in',
                'They stole his favourite sleeping blanket',
                "now he won't rest until it's returned",
                '..and that means neither can I!'
            );

            const choice = await player.ask(
                [
                    'Can I help at all?',
                    "I'm sorry to hear that, I hope you find his blanket"
                ],
                false
            );

            if (choice === 0) {
                // can I help?, quest started
                await initiateQuest(player, npc);
            } else if (choice === 1) {
                await player.say(
                    "I'm sorry to hear that, I hope you find his blanket"
                );
            }

            break;
        case 1: // too busy, (different capitalization than choice)
            await player.say("Sorry, i'm too busy to hear your problems");
            break;
    }
}

async function blanketStage(player, omad) {
    await player.say('Hello');

    await omad.say(
        '...yawn...oh, hello again...yawn..',
        '..please tell me you have the blanket'
    );

    if (player.inventory.has(BLANKET_ID)) {
        await player.say(
            'Yes I returned it from the clutches of the evil thieves'
        );

        await omad.say(
            "Really, that's excellent, well done",
            "that should cheer up Androe's son",
            'and maybe I will be able to get some rest',
            "..yawn..i'm off to bed, farewell brave traveller."
        );

        player.inventory.remove(BLANKET_ID);

        player.message(
            '@que@well done, you have completed part 1 of the monks friend' +
                ' quest'
        );

        player.questStages.monksFriend = 2;
    } else {
        await player.say("I'm afraid not");
        await omad.say('I need some sleep');
    }
}

async function lookForCedricStages(player, omad) {
    if (player.questStages.monksFriend !== 2) {
        // currently looking for cedric
        await player.say('Hi there!');
        await omad.say('oh my, I need a drink', 'where is that brother Cedric');
        return;
    }
    await player.say('Hello, how are you');

    await omad.say(
        "much better now i'm sleeping well",
        'now I can organise the party'
    );

    await player.say('what party?');

    await omad.say(
        "Androe's son's birthday party",
        "he's going to be one year old"
    );

    await player.say("that's sweet");

    await omad.say(
        "it's also a great excuse for a drink",
        'now we just need brother Cedric to return',
        'with the wine'
    );

    const choice = await player.ask(
        ["who's brother Cedric?", "enjoy it, i'll see you soon"],
        true
    );

    if (choice === 1) {
        // see you soon
        return;
    }
    await omad.say(
        'Cedric lives here too',
        'we sent him out three days ago',
        "to collect wine, but he didn't return",
        'he most probably got drunk',
        'and lost in the forest',
        "I don't suppose you could look for him?",
        'then we can really party'
    );

    const questOfferChoice = await player.ask(
        ["I've no time for that, sorry", 'where should I look?', 'can I come?'],
        true
    );

    switch (questOfferChoice) {
        case 0: // no time for that
            return;
        case 1: // where should I look for him?
            await omad.say("oh, he won't be far", 'probably out in the forest');
            break;
        case 2: // can I come to the party?
            await omad.say('of course,', 'but we need the wine first');
            break;
    }

    player.questStages.monksFriend = 3;
}

async function finalizeQuest(player, omad) {
    await player.say('Hi Omad, Brother Cedric is on his way');
    await omad.say('good,good,good', 'now we can party');

    player.addExperience(
        'woodcutting',
        4 * (player.skills.woodcutting.base + 1) * 125,
        false
    );

    player.questStages.monksFriend = -1;
    player.addQuestPoints(1);
    player.message('@gre@You haved gained 1 quest point!');

    player.inventory.add(LAW_RUNE_ID, 8);
    await omad.say(
        'I have little to repay you with',
        'but please, take these runestones'
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== OMAD_ID) {
        return false;
    }

    const questStage = player.questStages.monksFriend;

    player.engage(npc);

    if (!questStage) {
        await preQuestStart(player, npc);
    } else if (questStage === 1) {
        await blanketStage(player, npc);
    } else if (questStage >= 2 && questStage <= 5) {
        await lookForCedricStages(player, npc);
    } else if (questStage === 6) {
        await finalizeQuest(player, npc);
    } else {
        await npc.say('Dum dee do la la', 'Hiccup', "That's good wine");
    }

    player.disengage(npc);
    return true;
}

module.exports = { onTalkToNPC };
