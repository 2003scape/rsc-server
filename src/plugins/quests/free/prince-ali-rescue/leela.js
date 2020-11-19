// https://classic.runescape.wiki/w/Transcript:Leela

const BRONZE_KEY_ID = 242;
const LEELA_ID = 122;
const PASTE_ID = 240;
const ROPE_ID = 237;
const SKIRT_ID = 194;
const BLONDE_WIG_ID = 244;

async function makeADisguise(player, npc) {
    await npc.say(
        'Only the lady Keli, can wander about outside the jail',
        'The guards will shoot to kill if they see the prince out',
        'so we need a disguise well enough to fool them at a distance'
    );

    let disguiseItems = 0;

    if (player.inventory.has(BLONDE_WIG_ID)) {
        await npc.say('The wig you have got, well done');
        disguiseItems += 1;
    } else {
        await npc.say(
            'You need a wig, maybe made from wool',
            'If you find someone who can work with wool, ask them about it',
            'Then the old witch may be able to help you dye it'
        );
    }

    if (player.inventory.has(SKIRT_ID)) {
        await npc.say('You have got the skirt, good');
        disguiseItems += 1;
    } else {
        await npc.say("You will need to get a pink skirt, same as Keli's");
    }

    if (player.inventory.has(PASTE_ID)) {
        await npc.say(
            'You have the skin paint, well done',
            'I thought you would struggle to make that'
        );

        disguiseItems += 1;
    } else {
        await npc.say(
            'we still need something to colour the Princes skin lighter',
            "There's an old witch close to here, she knows about many things",
            'She may know some way to make the skin lighter'
        );
    }

    if (disguiseItems === 3) {
        await npc.say('You do have everything for the disguise');
    }

    if (player.inventory.has(ROPE_ID)) {
        await npc.say(
            'You have rope I see, tie up Keli',
            'that will be the most dangerous part of the plan'
        );
    } else {
        await npc.say(
            'You will still need some rope to tie up Keli, of course',
            'I heard that there was a good ropemaker around here'
        );
    }

    const choices = [
        'I need to get the key made',
        'What can i do with the guards?',
        'I will go and get the rest of the escape equipment'
    ];

    const hasKey = player.inventory.has(BRONZE_KEY_ID);

    if (hasKey) {
        choices.shift();
    }

    let choice = await player.ask(choices, true);

    if (hasKey) {
        choice += 1;
    }

    switch (choice) {
        case 0: // key made
            await keyMade(player, npc);
            break;
        case 1: // guards
            await doWithGuards(player, npc);
            break;
        case 2: // rest
            await restOfEquipment(npc);
            break;
    }
}

async function keyMade(player, npc) {
    await npc.say(
        'Yes, that is most important',
        'There is no way you can get the real key.',
        "It is on a chain around Keli's neck. almost impossible to steal",
        'get some soft clay, and get her to show you the key somehow',
        'then take the print, with bronze, to my father'
    );

    const choice = await player.ask(
        [
            'I must make a disguise. What do you suggest?',
            'What can i do with the guards?',
            'I will go and get the rest of the escape equipment'
        ],
        true
    );

    switch (choice) {
        case 0: // disguise
            await makeADisguise(player, npc);
            break;
        case 1: // guards
            await doWithGuards(player, npc);
            break;
        case 2: // rest
            await restOfEquipment(npc);
            break;
    }
}

async function doWithGuards(player, npc) {
    await npc.say(
        'Most of the guards will be easy',
        'The disguise will get past them',
        'The only guard who will be a problem will be the one at the door',
        'He is talkative, try to find a weakness in him',
        'We can discuss this more when you have the rest of the escape kit'
    );

    const choices = [
        'I must make a disguise. What do you suggest?',
        'I need to get the key made',
        'I will go and get the rest of the escape equipment'
    ];

    const hasKey = player.inventory.has(BRONZE_KEY_ID);

    if (hasKey) {
        choices.splice(1, 1);
    }

    let choice = await player.ask(choices, true);

    if (hasKey) {
        choice += 1;
    }

    switch (choice) {
        case 0: // disguise
            await makeADisguise(player, npc);
            break;
        case 1: // key made
            await keyMade(player, npc);
            break;
        case 2: // rest
            await restOfEquipment(npc);
            break;
    }
}

async function restOfEquipment(npc) {
    await npc.say('I shall await your return with everything');
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== LEELA_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    player.engage(npc);

    if (player.cache.bronzeKeyMade) {
        await npc.say(
            'My father sent this key for you, be careful not to lose it'
        );

        player.inventory.add(BRONZE_KEY_ID);

        player.message(
            '@que@Leela gives you a copy of the key to the princes door'
        );

        player.cache.bronzeKeyReceived = true;
        delete player.cache.bronzeKeyMade;
    }

    if (!questStage || questStage === 1) {
        await player.say('What are you waiting here for');
        await npc.say('That is no concern of yours, adventurer');
    } else if (questStage === 2) {
        const hasEquipment =
            player.cache.bronzeKeyReceived &&
            player.inventory.has(ROPE_ID) &&
            player.inventory.has(BLONDE_WIG_ID) &&
            player.inventory.has(SKIRT_ID) &&
            player.inventory.has(PASTE_ID);

        if (hasEquipment) {
            player.questStages.princeAliRescue = 3;
            return await onTalkToNPC(player, npc);
        }

        await player.say('I am here to help you free the prince');

        await npc.say(
            'Your employment is known to me.',
            'Now, do you know all that we need to make the break?'
        );

        const choices = [
            'I must make a disguise. What do you suggest?',
            'I need to get the key made',
            'What can i do with the guards?',
            'I will go and get the rest of the escape equipment'
        ];

        const hasKey = player.inventory.has(BRONZE_KEY_ID);

        if (hasKey) {
            choices.splice(1, 1);
        }

        let choice = await player.ask(choices, true);

        if (hasKey && choice > 0) {
            choice += 1;
        }

        switch (choice) {
            case 0: // disguise
                await makeADisguise(player, npc);
                break;
            case 1: // key made
                await keyMade(player, npc);
                break;
            case 2: // guards
                await doWithGuards(player, npc);
                break;
            case 3: // rest
                await restOfEquipment(npc);
                break;
        }
    } else if (questStage === 3) {
        await npc.say(
            'Good, you have all the basic equipment',
            'What are your plans to stop the guard interfering?'
        );

        const choice = await player.ask(
            [
                "I haven't spoken to him yet",
                'I was going to attack him',
                'I hoped to get him drunk',
                'Maybe I could bribe him to leave'
            ],
            true
        );

        switch (choice) {
            case 0: // haven't spoken
                await npc.say(
                    'Well, speaking to him may find a weakness he has',
                    'See if theres something that could stop him bothering us'
                );
                break;
            case 1: // attack him
                await npc.say(
                    "I don't think you should",
                    'If you do the rest of the gang and Keli would attack you',
                    'The door guard should be removed first, to make it easy'
                );
                break;
            case 2: // get him drunk
                await npc.say(
                    'Well, thats possible. These guards do like a drink',
                    'I would think that it will take at least 3 beers to do ' +
                        'it well',
                    'You would probably have to do it all at the same time too',
                    'The effects of the local beer wear of quickly'
                );
                break;
            case 3: // bribe him
                await npc.say(
                    "You could try. I don't think the emir will pay anything " +
                        'towards it',
                    'And we did bribe one of their guards once',
                    'Keli killed him in front of the other guards, as a ' +
                        'deterrent',
                    'It would probably take a lot of gold'
                );
                break;
        }

        await npc.say(
            'Good luck with the guard. When the guard is out you can tie up ' +
                'Keli'
        );
    } else if (questStage === 4 || questStage === -1) {
        await npc.say(
            'Thank you, Al Kharid will forever owe you for your help',
            'I think that if there is ever anything that needs to be done,',
            'you will be someone they can rely on'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
