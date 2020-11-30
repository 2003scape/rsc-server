// https://classic.runescape.wiki/w/Transcript:Oziach

const MAZE_KEY_ID = 421;
const OZIACH_ID = 187;

async function getEverything(npc) {
    await npc.say('Fare ye well');
}

async function firstMapPiece(player, npc) {
    await npc.say(
        "deep in a strange building known as Melzar's maze",
        'Located north west of Rimmington'
    );

    if (!player.inventory.has(MAZE_KEY_ID)) {
        const { world } = player;

        await npc.say(
            'You will need this to get in',
            'This is the key to the front entrance to the maze'
        );

        player.inventory.add(MAZE_KEY_ID);
        player.message('@que@Oziach hands you a key');
        await world.sleepTicks(3);
    }

    const choice = await player.ask(
        [
            'Where can I get an antidragon shield?',
            'Where is the second piece of map?',
            'Where is the third piece of map?',
            "Ok. I'll try and get everything together"
        ],
        true
    );

    switch (choice) {
        case 0: // shield
            await findShield(player, npc);
            break;
        case 1: // second piece
            await secondMapPiece(player, npc);
            break;
        case 2: // third piece
            await thirdMapPiece(player, npc);
            break;
        case 3: // get everything
            await getEverything(npc);
            break;
    }
}

async function secondMapPiece(player, npc) {
    await npc.say('You will need to talk to the oracle on the ice mountain');

    const choice = await player.ask(
        [
            'Where can I get an antidragon shield?',
            'Where is the first piece of map?',
            'Where is the third piece of map?',
            "Ok, I'll try and get everything together"
        ],
        true
    );

    switch (choice) {
        case 0: // shield
            await findShield(player, npc);
            break;
        case 1: // first piece
            await firstMapPiece(player, npc);
            break;
        case 2: // third piece
            await thirdMapPiece(player, npc);
            break;
        case 3: // get everything
            await getEverything(npc);
            break;
    }
}

async function thirdMapPiece(player, npc) {
    await npc.say(
        'That was stolen by one of the goblins from the goblin village'
    );

    const choice = await player.ask(
        [
            'Where can I get an antidragon shield?',
            'Where is the first piece of map?',
            'Where is the second piece of map?',
            "Ok, I'll try and get everything together"
        ],
        true
    );

    switch (choice) {
        case 0: // shield
            await findShield(player, npc);
            break;
        case 1: // first piece
            await firstMapPiece(player, npc);
            break;
        case 2: // second piece
            await secondMapPiece(player, npc);
            break;
        case 3: // get everything
            await getEverything(npc);
            break;
    }
}

async function whereIsDragon(player, npc) {
    await npc.say(
        'That is a problem too yes',
        'No one knows where the Isle of Crandor is located',
        'There was a map',
        'But it was torn up into three pieces',
        'Which are now scattered across Asgarnia',
        "You'll also struggle to find someone bold enough to take a ship to " +
            'Crandor Island'
    );

    const choice = await player.ask(
        [
            'Where is the first piece of map?',
            'Where is the second piece of map?',
            'Where is the third piece of map?',
            'Where can I get an antidragon shield?'
        ],
        true
    );

    switch (choice) {
        case 0: // first
            await firstMapPiece(player, npc);
            break;
        case 1: // second
            await secondMapPiece(player, npc);
            break;
        case 2: // third
            await thirdMapPiece(player, npc);
            break;
        case 3: // shield
            await findShield(player, npc);
            break;
    }
}

async function findShield(player, npc) {
    await npc.say(
        'I believe the Duke of Lumbrige Castle may have one in his armoury'
    );

    const choice = await player.ask(
        [
            'So where can I find this dragon?',
            "Ok, I'll try and get everything together"
        ],
        true
    );

    switch (choice) {
        case 0: // dragon
            await whereIsDragon(player, npc);
            break;
        case 1: // get everything
            await getEverything(npc);
            break;
    }
}

async function promptFind(player, npc) {
    const choice = await player.ask(
        [
            'So where can I find this dragon?',
            'Where can I get an antidragon shield?'
        ],
        true
    );

    switch (choice) {
        case 0: // dragon
            await whereIsDragon(player, npc);
            break;
        case 1: // shield
            await findShield(player, npc);
            break;
    }
}

async function specialEquipment(player, npc) {
    await npc.say(
        'Elvarg really is one of the most powerful dragons',
        "I really wouldn't recommend charging in without special equipment",
        'Her breath is the main thing to watch out for',
        'You can get fried very fast',
        'Unless you have a special flameproof antidragon shield',
        "It won't totally protect you",
        'but it should prevent some of the damage to you'
    );

    player.questStages.dragonSlayer = 2;

    await promptFind(player, npc);
}

async function proveToMe(player, npc) {
    await npc.say(
        'This is armour fit for a hero to be sure',
        "So you'll need to prove to me that you're a hero before you can buy " +
            'some'
    );

    const choice = await player.ask(
        ['So how am I meant to prove that?', "That's a pity, I'm not a hero"],
        true
    );

    if (choice === 0) {
        await npc.say(
            'Well if you want to prove yourself',
            'You could try and defeat Elvarg the dragon of the Isle of Crandor'
        );

        const choice = await player.ask(
            [
                'A dragon, that sounds like fun',
                'And will i need anything to defeat this dragon',
                "I may be a champion, but I don't think I'm up to dragon " +
                    'killing yet'
            ],
            false
        );

        switch (choice) {
            case 0: // fun
                await player.say('A dragon, that sounds like fun');
                await specialEquipment(player, npc);
                break;
            case 1: // need anything
                await player.say(
                    'And will I need anything to defeat this dragon?'
                );

                await npc.say("It's funny you shoud say that");
                await specialEquipment(player, npc);
                break;
            case 2: // not up to it
                await player.say(
                    "I may be a champion, but I don't think I'm up to dragon " +
                        'killing yet'
                );

                await npc.say('Yes I can understand that');
                break;
        }
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== OZIACH_ID) {
        return false;
    }

    const questStage = player.questStages.dragonSlayer;

    player.engage(npc);

    if (!questStage || questStage === 1) {
        await npc.say('Aye tiz a fair day my friend');

        const choices = ["I'm not your friend", "Yes it's a very nice day"];

        if (questStage === 1) {
            choices.unshift('Can you sell me some rune plate mail?');
        }

        let choice = await player.ask(choices, true);

        if (questStage !== 1) {
            choice += 1;
        }

        switch (choice) {
            // rune plate mail
            case 0: {
                await npc.say("Soo how does thee know I'ave some?");

                const choice = await player.ask(
                    [
                        'The guildmaster of the champion guild told me',
                        'I am a master detective'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // guildmaster told me
                        await npc.say(
                            "Well if you're worthy of his advise",
                            'You must have something going for you',
                            "He has been known to let some weeklin's into " +
                                'his guild though',
                            "I don't want just any old pumpkinmush to have " +
                                'this armour',
                            'jus cos they have a large amount of cash'
                        );

                        await proveToMe(player, npc);
                        break;
                    case 1: // master detective
                        await npc.say('well however you found out about it');
                        await proveToMe(player, npc);
                        break;
                }
                break;
            }
            case 1: // not your friend
                await npc.say(
                    "I'd be surprised if your anyone's friend with that sort " +
                        'of manners'
                );
                break;
            case 2: // nice day
                await npc.say('Aye may the Gods walk by your side');
                break;
        }
    } else if (questStage >= 2) {
        await npc.say('So how is thy quest going');
        await promptFind(player, npc);
    } else if (questStage === -1) {
        await player.say('I have slain the dragon');
        await npc.say('Well done');

        const choice = await player.ask(
            ['Can I buy a rune mail body now please?', 'Thank you'],
            true
        );

        if (choice === 0) {
            player.disengage();
            player.openShop('oziachs-body-armour');
            return true;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
