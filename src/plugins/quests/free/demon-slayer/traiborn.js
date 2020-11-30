// https://classic.runescape.wiki/w/Transcript:Traiborn_the_wizard

const BONES_ID = 20;
const SPINACH_ROLL_ID = 179;
const TRAIBORN_ID = 17;
const TRAIBORN_KEY_ID = 25;

async function cunningSheep(npc) {
    await npc.say(
        'Oh ok have a good time',
        'and watch out for sheep!',
        "They're more cunning than they look"
    );
}

async function whatsAThingummywut(player, npc) {
    await npc.say(
        'A thingummywut?',
        'Where? , Where?',
        'Those pesky thingummywuts',
        'They get everywhere',
        'They leave a terrible mess too'
    );

    const choice = await player.ask(
        [
            'Err you just called me thingummywut',
            "Tell me what they look like and I'll mash 'em"
        ],
        true
    );

    switch (choice) {
        // called me a thingummywut
        case 0: {
            await npc.say(
                "You're a thingummywut?",
                "I've never seen one up close before",
                'They said I was mad',
                'Now you are my proof',
                'There ARE thingummywuts in this tower',
                'Now where can I find a cage big enough to keep you?'
            );

            const choice = await player.ask(
                ["Err I'd better be off really", "They're right, you are mad"],
                true
            );

            switch (choice) {
                case 0: // better be off
                    await cunningSheep(npc);
                    break;
                case 1: // you're mad
                    await npc.say(
                        "That's a pity",
                        'I thought maybe they were winding me up'
                    );
                    break;
            }
            break;
        }
        case 1: // mash em
            await npc.say(
                "Don't be ridiculous",
                'No-one has ever seen one',
                "They're invisible",
                'Or a myth',
                'Or a figment of my imagination',
                "Can't remember which right now"
            );
            break;
    }
}

async function keysKnockingAround(player, npc) {
    const { world } = player;

    await npc.say(
        'Now you come to mention it - yes I do have a key',
        'Its in my special closet of valuable stuff',
        'Now how do I get into that?'
    );

    player.message('@que@The wizard scratches his head');
    await world.sleepTicks(3);

    await npc.say(
        'I sealed it using one of my magic rituals',
        'so it would make sense that another ritual',
        'Would open it again'
    );

    player.message('@que@The wizard beams');
    await world.sleepTicks(3);

    await player.say('So do you know what ritual to use?');

    await npc.say(
        'Let me think a second',
        'Yes a simple drazier style ritual should suffice',
        'Hmm',
        "Main problem with that is I'll need 25 sets of bones",
        'Now where am I going to get hold of something like that'
    );

    const choice = await player.ask(
        [
            "Hmm, that's too bad. I really need that key",
            "I'll get the bones for you"
        ],
        true
    );

    switch (choice) {
        case 0: // too bad
            await npc.say("Ah well sorry I couldn't be any more help");
            break;
        case 1: // i'll get the bones
            await npc.say('Ooh that would very good of you');
            await player.say("Ok I'll speak to you when I've got some bones");
            player.cache.traibornBones = 0;
            break;
    }
}

async function tellMeIfYouHaveKey(player, npc) {
    await npc.say(
        'The key?',
        'The key to what?',
        "There's more than one key in the world, don't you know",
        'Would be a bit odd if there was only one'
    );

    const choice = await player.ask(
        [
            "It's the key to get a sword called Silverlight",
            "You've lost it, haven't you?"
        ],
        true
    );

    switch (choice) {
        // for silverlight
        case 0: {
            await npc.say(
                'Silverlight? Never heard of that',
                'Sounds a good name for a ship',
                "Are you sure it's not the name of a ship, " +
                    'rather than a sword?'
            );

            const choice = await player.ask(
                [
                    'Yeah, pretty sure',
                    'Well, have you got any keys knocking around?'
                ],
                true
            );

            switch (choice) {
                // pretty sure
                case 0: {
                    await npc.say("That's a pity", 'Waste of a name');

                    const choice = await player.ask(
                        [
                            "Err I'd better be off really",
                            'Well, have you got any keys knocking around?'
                        ],
                        true
                    );

                    switch (choice) {
                        case 0: // better be off
                            await cunningSheep(npc);
                            break;
                        case 1: // keys knocking around
                            await keysKnockingAround(player, npc);
                            break;
                    }
                    break;
                }
                case 1: // keys knocking around
                    await keysKnockingAround(player, npc);
                    break;
            }
            break;
        }
        case 1: // lost it
            await npc.say('Me?  Lose things?', 'Thats a nasty accusation');
            await player.say('Well, have you got any keys knocking around?');
            await keysKnockingAround(player, npc);
            break;
    }
}

async function sirPrysinsKey(player, npc) {
    const { world } = player;

    await npc.say("Sir Prysin?  Who's that?", 'What would I want his key for?');

    const choice = await player.ask(
        [
            'He told me you were looking after it for him',
            "He's one of the king's knights",
            'Well, have you got any keys knocking around?'
        ],
        true
    );

    switch (choice) {
        case 0: {
            // looking after it
            await npc.say(
                "That wasn't very clever of him",
                "I'd lose my head if it wasn't screwed on proper",
                'Go tell him to find someone else',
                'to look after his valuables in future'
            );

            const choice = await player.ask(
                [
                    "Ok, I'll go and tell him that",
                    'Well, have you got any keys knocking around?'
                ],
                true
            );

            switch (choice) {
                case 0: {
                    // tell him that
                    await npc.say(
                        "Oh that's great",
                        "If it wouldn't be too much trouble"
                    );

                    const choice = await player.ask(
                        [
                            "Err I'd better be off really",
                            'Well, have you got any keys knocking around?'
                        ],
                        true
                    );

                    switch (choice) {
                        case 0: // better be off
                            await cunningSheep(npc);
                            break;
                        case 1: // keys knocking around
                            await keysKnockingAround(player, npc);
                            break;
                    }
                    break;
                }
                case 1: // keys knocking around
                    await keysKnockingAround(player, npc);
                    break;
            }
            break;
        }
        case 1: {
            // king's knights
            await npc.say(
                'Say, I remember a knight with a key',
                'He had nice shoes',
                "and didn't like my homemade spinach rolls",
                'Would you like a spinach roll?'
            );

            const choice = await player.ask(
                ['Yes Please', 'Just tell me if you have the key'],
                true
            );

            switch (choice) {
                // yes please
                case 0: {
                    player.message(
                        '@que@Traiborn digs around in the pockets of his robes'
                    );

                    await world.sleepTicks(3);

                    player.inventory.add(SPINACH_ROLL_ID);
                    player.message('@que@Traiborn hands you a spinach roll');
                    await player.say('Thank you very much');

                    const choice = await player.ask(
                        [
                            "Err I'd better be off really",
                            'Well, have you got any keys knocking around?'
                        ],
                        true
                    );

                    switch (choice) {
                        case 0: // better be off
                            await cunningSheep(npc);
                            break;
                        case 1: // keys knocking around
                            await keysKnockingAround(player, npc);
                            break;
                    }
                    break;
                }
                case 1:
                    await tellMeIfYouHaveKey(player, npc);
                    break;
            }
            break;
        }
        case 2: // keys knocking around
            await keysKnockingAround(player, npc);
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== TRAIBORN_ID) {
        return false;
    }

    player.engage(npc);

    if (
        player.cache.traibornBones >= 25 &&
        !player.inventory.has(TRAIBORN_KEY_ID)
    ) {
        await player.say("I've lost the key you gave me");

        await npc.say(
            'Yes I know',
            'It was returned to me',
            'If you want it back',
            "you're going to have to collect another 25 sets of bones"
        );

        player.cache.traibornBones = 0;
    } else if (
        player.cache.hasOwnProperty('traibornBones') &&
        player.cache.traibornBones < 25 &&
        !player.inventory.has(TRAIBORN_KEY_ID)
    ) {
        await npc.say('How are you doing finding bones?');

        if (player.inventory.has(BONES_ID)) {
            const { world } = player;

            await player.say('I have some bones');
            await npc.say("Give 'em here then");

            while (player.inventory.has(BONES_ID)) {
                player.message('You give Traiborn a set of bones');
                player.inventory.remove(BONES_ID);
                player.cache.traibornBones += 1;
                await world.sleepTicks(3);

                if (player.cache.traibornBones >= 25) {
                    await npc.say("Hurrah! That's all 25 sets of bones");

                    player.message(
                        '@que@Traiborn places the bones in a circle on the ' +
                            'floor'
                    );

                    await world.sleepTicks(3);

                    player.message('@que@Traiborn waves his arms about');
                    await world.sleepTicks(3);

                    await npc.say(
                        'Wings of dark and colour too',
                        'Spreading in the morning dew'
                    );

                    player.message('@que@The wizard waves his arms some more');
                    await world.sleepTicks(3);

                    await npc.say(
                        'Locked away I have a key',
                        'Return it now unto me'
                    );

                    player.message('@que@Traiborn smiles');
                    await world.sleepTicks(3);

                    player.inventory.add(TRAIBORN_KEY_ID);
                    player.message('@que@Traiborn hands you a key');
                    await world.sleepTicks(3);

                    await player.say('Thank you very much');

                    await npc.say(
                        "Not a problem for a friend of sir what's-his-face"
                    );

                    player.disengage();
                    return true;
                }
            }

            await player.say("That's all of them");
            await npc.say('I still need more');
            await player.say("Ok, I'll look for some more");
        } else {
            await player.say("I haven't got any at the moment");
            await npc.say('Never mind. Keep working on it');
        }
    } else {
        const questStage = player.questStages.demonSlayer;

        await npc.say('Ello young thingummywut');

        const choices = [
            'Whats a thingummywut?',
            'Teach me to be a mighty and powerful wizard'
        ];

        if (questStage === 2 && !player.inventory.has(TRAIBORN_KEY_ID)) {
            choices.push('I need to get a key given to you by Sir Prysin');
        }

        const choice = await player.ask(choices, true);

        switch (choice) {
            case 0: // whats a thingummywut
                await whatsAThingummywut(player, npc);
                break;
            // mighty and powerful
            case 1: {
                await npc.say(
                    'Wizard, Eh?',
                    "You don't want any truck with that sort",
                    "They're not to be trusted",
                    "That's what I've heard anyways"
                );

                const choice = await player.ask(
                    [
                        "So aren't you a wizard?",
                        "Oh I'd better stop talking to you then"
                    ],
                    true
                );

                switch (choice) {
                    case 0: // aren't you a wizard
                        await npc.say(
                            'How dare you?',
                            "Of course I'm a wizard",
                            "Now don't be so cheeky or I'll turn you into a " +
                                'frog'
                        );
                        break;
                    case 1: // stop talking to you
                        await npc.say(
                            'Cheerio then',
                            'Was nice chatting to you'
                        );
                        break;
                }
                break;
            }
            case 2: // key
                await sirPrysinsKey(player, npc);
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
