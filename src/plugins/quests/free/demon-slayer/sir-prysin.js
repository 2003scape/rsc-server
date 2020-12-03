// https://classic.runescape.wiki/w/Transcript:Sir_Prysin

const DRAIN_KEY_ID = 51;
const ROVIN_KEY_ID = 26;
const SILVERLIGHT_ID = 52;
const SIR_PRYSIN_ID = 16;
const TRAIBORN_KEY_ID = 25;

async function keyHunting(npc) {
    await npc.say('Ok goodbye');
}

async function yourKeyLocation(player, npc) {
    await npc.say(
        'Um',
        'Ah',
        "Well there's a problem there as well",
        'I managed to drop the key in the drain',
        'Just outside the palace kitchen',
        "It is just inside and I can't reach it"
    );

    const choice = await player.ask(
        [
            'So what does the drain lead to?',
            'Where can I find Captain Rovin?',
            'Where does the wizard live?',
            "Well I'd better go key hunting"
        ],
        true
    );

    switch (choice) {
        // drain
        case 0: {
            await npc.say(
                'It is the drain',
                'For the drainpipe running from the sink in the kitchen',
                'Down to the palace sewers'
            );

            const choice = await player.ask(
                [
                    'Where can I find Captain Rovin?',
                    'Where does the wizard live?',
                    "Well I'd better go key hunting"
                ],
                true
            );

            switch (choice) {
                case 0: // captain rovin
                    await captainRovinLocation(player, npc);
                    break;
                case 1: // wizard
                    await wizardLocation(player, npc);
                    break;
                case 2: // key hunting
                    await keyHunting(npc);
                    break;
            }
            break;
        }
        case 1: // captain rovin
            await captainRovinLocation(player, npc);
            break;
        case 2: // wizard
            await wizardLocation(player, npc);
            break;
        case 3: // key hunting
            await keyHunting(npc);
            break;
    }
}

async function captainRovinLocation(player, npc) {
    await npc.say(
        'Captain Rovin lives at the top of the guards quarters',
        'in the northwest wing of this palace'
    );

    const choice = await player.ask(
        [
            'Can you give me your key?',
            'Where does the wizard live?',
            "Well I'd better go key hunting"
        ],
        true
    );

    switch (choice) {
        case 0: // your key
            await yourKeyLocation(player, npc);
            break;
        case 1: // wizard
            await wizardLocation(player, npc);
            break;
        case 2: // key hunting
            await keyHunting(npc);
            break;
    }
}

async function wizardLocation(player, npc) {
    await npc.say(
        'Wizard Traiborn?',
        'He is one of the wizards who lives in the tower',
        'On the little island just off the south coast',
        'I believe his quarters are on the first floor of the tower'
    );

    const choice = await player.ask(
        [
            'Can you give me your key?',
            'Where can I find Captain Rovin?',
            "Well I'd better go key hunting"
        ],
        true
    );

    switch (choice) {
        case 0: // your key
            await yourKeyLocation(player, npc);
            break;
        case 1: // captain rovin
            await captainRovinLocation(player, npc);
            break;
        case 2: // key hunting
            await keyHunting(npc);
            break;
    }
}

async function keyLocations(player, npc) {
    await npc.say(
        'I kept one of the keys',
        'I gave the other two',
        'To other people for safe keeping',
        'One I gave to Rovin',
        'who is captain of the palace guard',
        'I gave the other to the wizard Traiborn'
    );

    const choice = await player.ask(
        [
            'Can you give me your key?',
            'Where can I find Captain Rovin?',
            'Where does the wizard live?'
        ],
        true
    );

    switch (choice) {
        case 0: // your key
            await yourKeyLocation(player, npc);
            break;
        case 1: // captain rovin
            await captainRovinLocation(player, npc);
            break;
        case 2: // wizard
            await wizardLocation(player, npc);
            break;
    }
}

async function findSilverlight(player, npc) {
    await npc.say('What do you need to find that for?');
    await player.say('I need it to fight Delrith');
    await npc.say('Delrith?', 'I thought the world was rid of him');

    let choice = await player.ask(
        [
            "Well, the gypsy's crystal ball seems to think otherwise",
            "He's back and unfortunatly I've got to deal with him"
        ],
        true
    );

    switch (choice) {
        case 0: // crystal ball
            await npc.say("Well if the ball says so, I'd better help you");
            break;
        case 1: // he's back
            await npc.say(
                "You don't look up to much",
                'I suppose Silverlight may be good enough to carry you ' +
                    'through though'
            );
            break;
    }

    await npc.say('The problem is getting silverlight');
    await player.say("You mean you don't have it?");

    await npc.say(
        'Oh I do have it',
        'But it is so powerful',
        'That I have put it in a special box',
        'Which needs three different keys to open it',
        "That way, it won't fall into the wrong hands"
    );

    choice = await player.ask(
        ['So give me the keys', 'And why is this a problem?'],
        true
    );

    if (choice === 0) {
        await npc.say('Um', "Well, It's not so easy");
    }

    player.questStages.demonSlayer = 2;

    await keyLocations(player, npc);
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== SIR_PRYSIN_ID) {
        return false;
    }

    const questStage = player.questStages.demonSlayer;

    player.engage(npc);

    if (!questStage || questStage === 1) {
        await npc.say('Hello, who are you');

        const choices = [
            'I am a mighty adventurer. Who are you?',
            "I'm not sure, I was hoping you could tell me"
        ];

        if (questStage === 1) {
            choices.push('Gypsy Aris said I should come and talk to you');
        }

        const choice = await player.ask(choices, true);

        switch (choice) {
            case 0: // mighty adventurer
                await npc.say('I am', 'A bold and famous knight of the realm');
                break;
            case 1: // tell me
                await npc.say("Well I've never met you before");
                break;
            // gypsy aris
            case 2: {
                await npc.say(
                    'Gypsy Aris?  Is she still alive?',
                    'I remember her from when I was pretty young',
                    'Well what do you need to talk to me about?'
                );

                const choice = await player.ask(
                    ['I need to find Silverlight', 'Yes, she is still alive'],
                    true
                );

                switch (choice) {
                    case 0: // find silverlight
                        await findSilverlight(player, npc);
                        break;
                    case 1: // still alive
                        await npc.say(
                            'I would have thought she would have died by now',
                            'She was pretty old, when I was a lad',
                            'Anyway, what can I do for you?'
                        );

                        await player.say('I need to find Silverlight');
                        await findSilverlight(player, npc);
                        break;
                }
                break;
            }
        }
    } else if (questStage === 2) {
        if (player.inventory.has(SILVERLIGHT_ID)) {
            await npc.say('You sorted that demon yet?');
            await player.say('No, not yet');

            await npc.say(
                'Well get on with it',
                "He'll be pretty powerful when he gets to full strength"
            );
        } else {
            await npc.say('So how are you doing with getting the keys?');

            let foundKeys = 0;
            let hasTraibornKey = false;
            let hasRovinKey = false;
            let hasDrainKey = false;

            if (player.inventory.has(TRAIBORN_KEY_ID)) {
                hasTraibornKey = true;
                foundKeys += 1;
            }

            if (player.inventory.has(ROVIN_KEY_ID)) {
                hasRovinKey = true;
                foundKeys += 1;
            }

            if (player.inventory.has(DRAIN_KEY_ID)) {
                hasDrainKey = true;
                foundKeys += 1;
            }

            if (foundKeys === 3) {
                const { world } = player;

                await player.say("I've got them all");
                await npc.say('Excellent. Now I can give you Silverlight');

                player.message('@que@You give all three keys to Sir Prysin');
                await world.sleepTicks(3);
                player.message('@que@Sir Prysin unlocks a long thin box');
                await world.sleepTicks(3);

                // it doesn't remove the keys until he gives you the sword
                // https://youtu.be/izkjtqCBRX4?t=418
                player.inventory.remove(TRAIBORN_KEY_ID);
                player.inventory.remove(ROVIN_KEY_ID);
                player.inventory.remove(DRAIN_KEY_ID);
                player.inventory.add(SILVERLIGHT_ID);

                player.message(
                    '@que@Prysin hands you an impressive looking sword'
                );
            } else {
                if (foundKeys > 0) {
                    await player.say("I've made a start");

                    if (hasTraibornKey) {
                        await player.say(
                            "I've got the key off Wizard Traiborn"
                        );
                    }

                    if (hasRovinKey) {
                        await player.say("I've got the key off Captain Rovin");
                    }

                    if (hasDrainKey) {
                        await player.say(
                            "I've got the key You dropped down the drain"
                        );
                    }
                } else {
                    await player.say("I've not found any of them yet");
                }

                const choice = await player.ask(
                    [
                        'Can you remind me where all the keys were again',
                        "I'm still looking"
                    ],
                    true
                );

                switch (choice) {
                    case 0: // remind me
                        await keyLocations(player, npc);
                        break;
                    case 1: // still looking
                        await npc.say("Ok, tell me when you've got them all");
                        break;
                }
            }
        }
    } else if (questStage === -1) {
        await npc.say("Hello, I've heard you stopped that demon well done");
        await player.say("Yes, that's right");
        await npc.say('A good job well done then', 'Thank you');
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
