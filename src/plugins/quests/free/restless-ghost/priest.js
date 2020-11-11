// https://classic.runescape.wiki/w/Transcript:Priest

const PRIEST_ID = 9;
const SKULL_ID = 27;

async function slimeAndTenticles(player, npc) {
    const choice = await player.ask(
        [
            "You don't understand. This a computer game",
            'I am - do you like my disguise?'
        ],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('I beg your pardon?');
            await player.say('Never mind');
            break;
        case 1:
            await npc.say('Aargh begone foul creature from another dimension');
            await player.say('Ok, Ok, It was a joke');
            break;
    }
}

async function priestWorld(player, npc) {
    const choice = await player.ask(
        ['Oh that Saradomin', "Oh sorry I'm not from this world"],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('There is only one Saradomin');
            break;
        case 1:
            await npc.say(
                "That's strange",
                'I thought things not from this world were all slime and ' +
                    'tenticles'
            );

            await slimeAndTenticles(player, npc);
            break;
    }
}

async function startQuest(player, npc) {
    await npc.say("That's lucky, I need someone to do a quest for me");
    await player.say("Ok I'll help");

    await npc.say(
        'Ok the problem is, there is a ghost in the church graveyard',
        'I would like you to get rid of it',
        'If you need any help',
        'My friend father Urhney is an expert on ghosts',
        'I believe he is currently living as a hermit',
        'He has a little shack somewhere in the swamps south of here',
        "I'm sure if you told him that I sent you he'd be willing to help",
        'My name is father Aereck by the way',
        'Be careful going through the swamps',
        'I have heard they can be quite dangerous'
    );

    player.questStages.theRestlessGhost = 1;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== PRIEST_ID) {
        return false;
    }

    player.engage(npc);

    const questStage = player.questStages.theRestlessGhost;

    if (!questStage || questStage === -1) {
        await npc.say('Welcome to the church of holy Saradomin');

        const choice = await player.ask(
            [
                "Who's Saradomin?",
                "Nice place you've got here",
                "I'm looking for a quest"
            ],
            true
        );

        switch (choice) {
            case 0: // whos saradomin
                await npc.say(
                    'Surely you have heard of the God, Saradomin?',
                    'He who creates the forces of goodness and purity in ' +
                        'this world?',
                    'I cannot believe your ignorance!',
                    'This is the God with more followers than any other!',
                    'At least in these parts!',
                    'He who along with his brother Guthix and Zamorak ' +
                        'created this world'
                );

                await priestWorld(player, npc);
                break;
            case 1: // nice place
                await npc.say("It is, isn't it?", 'It was built 230 years ago');
                break;
            case 2: // quest
                if (!questStage) {
                    await startQuest(player, npc);
                } else {
                    await npc.say('Sorry I only had the one quest');
                }
                break;
        }

        player.disengage();

        return true;
    } else {
        await npc.say('Have you got rid of the ghost yet?');
    }

    switch (questStage) {
        case 1: // just started
            await player.say("I can't find father Urhney at the moment");
            await npc.say(
                'Well to get to the swamp he is in',
                'you need to go round the back of the castle',
                'The swamp is on the otherside of the fence to the south',
                "You'll have to go through the wood to the west to get round " +
                    'the fence',
                "Then you'll have to go right into the eastern depths of the " +
                    'swamp'
            );
            break;
        case 2: // found urhney
            await player.say(
                'I had a talk with father Urhney',
                'He has given me this funny amulet to talk to the ghost with'
            );

            await npc.say(
                'I always wondered what that amulet was',
                "Well I hope it's useful. Tell me if you get rid of the ghost"
            );
            break;
        case 3: // spoken to ghost
            if (player.inventory.has(SKULL_ID)) {
                await player.say("I've finally found the ghost's skull");

                await npc.say(
                    "Great. Put it in the ghost's coffin and see what happens!"
                );
            } else {
                await player.say(
                    "I've found out that the ghost's corpse has lost its skull",
                    'If I can find the skull the ghost will go'
                );

                await npc.say(
                    'That would explain it',
                    "Well I haven't seen any skulls"
                );

                await player.say('Yes I think a warlock has stolen it');
                await npc.say('I hate warlocks', 'Ah well good luck');
            }
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
