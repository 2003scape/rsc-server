// https://classic.runescape.wiki/w/Transcript:Urhney

const GHOSTSPEAK_AMULET_ID = 24;
const URHNEY_ID = 10;

async function ghostHaunting(player, npc) {
    const { world } = player;

    await npc.say(
        'Oh the silly fool',
        'I leave town for just five months',
        "and already he can't manage",
        'Sigh',
        "Well I can't go back and exorcise it",
        'I vowed not to leave this place',
        'Until I had done a full two years of prayer and meditation',
        'Tell you what I can do though',
        'Take this amulet'
    );

    player.message('Father Urhney hands you an amulet');
    player.inventory.add(GHOSTSPEAK_AMULET_ID);
    await world.sleepTicks(2);

    await npc.say(
        'It is an amulet of Ghostspeak',
        'So called because when you wear it you can speak to ghosts',
        'A lot of ghosts are doomed to be ghosts',
        'Because they have left some task uncompleted',
        'Maybe if you know what this task is',
        'You can get rid of the ghost',
        "I'm not making any guarantees mind you",
        'But it is the best I can do right now'
    );

    await player.say("Thank you, I'll give it a try");

    player.questStages.theRestlessGhost = 2;
}

async function whatProblems(player, npc) {
    await npc.say(
        "I suppose I'd better talk to you then",
        'What problems has he got himself into this time?'
    );

    const choice = await player.ask(
        [
            "He's got a ghost haunting his graveyard",
            'You mean he gets himself into lots of problems?'
        ],
        true
    );

    switch (choice) {
        case 0: // ghost haunting
            await ghostHaunting(player, npc);
            break;
        case 1: // other problems
            await npc.say(
                'Yeah. For example when we were trainee priests',
                'He kept on getting stuck up bell ropes',
                "Anyway I don't have time for chitchat",
                "What's his problem this time?"
            );

            await player.say("He's got a ghost haunting his graveyard");
            await ghostHaunting(player, npc);
            break;
    }
}

async function lostAmulet(player, npc) {
    const { world } = player;

    player.message('Father Urhney sighs');

    await npc.say(
        'How careless can you get',
        "Those things aren't easy to come by you know",
        "It's a good job I've got a spare"
    );

    player.inventory.add(GHOSTSPEAK_AMULET_ID);
    player.message('Father Urhney hands you an amulet');
    await world.sleepTicks(2);

    await npc.say('Be more careful this time');
    await player.say("Ok I'll try to be");
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== URHNEY_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say("Go away, I'm meditating");

    const choices = [
        "Well that's friendly",
        "I've come to repossess your house"
    ];

    const questStage = player.questStages.theRestlessGhost;

    let offerAmulet = false;

    if (
        questStage &&
        questStage !== -1 &&
        !player.inventory.has(GHOSTSPEAK_AMULET_ID)
    ) {
        offerAmulet = true;

        if (questStage === 1) {
            choices.unshift('Father Aereck sent me to talk to you');
        } else {
            choices.unshift("I've lost the amulet");
        }
    }

    let choice = await player.ask(choices, true);

    if (!offerAmulet) {
        choice += 1;
    }

    switch (choice) {
        case 0: // get amulet
            if (questStage === 1) {
                await whatProblems(player, npc);
            } else {
                await lostAmulet(player, npc);
            }
            break;
        case 1: // friendly
            await npc.say('I said go away!');
            await player.say('Ok, ok');
            break;
        case 2: {
            // reposses house
            await npc.say('Under what grounds?');

            const choice = await player.ask(
                [
                    'Repeated failure on mortgage payments',
                    "I don't know, I just wanted this house"
                ],
                true
            );

            switch (choice) {
                case 0: // mortgage
                    await npc.say(
                        "I don't have a mortgage",
                        'I built this house myself'
                    );

                    await player.say(
                        'Sorry I must have got the wrong address',
                        'All the houses look the same around here'
                    );
                    break;
                case 1: // wanted house
                    await npc.say('Oh go away and stop wasting my time');
                    break;
            }
            break;
        }
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
