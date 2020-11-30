// https://classic.runescape.wiki/w/Transcript:Joe

const BEER_ID = 193;
const JOE_ID = 121;

async function lifeOfAGuard(npc) {
    await npc.say(
        'Well, the hours are good.....',
        '.... But most of those hours are a drag',
        'If only I had spent more time in Knight School when I was a young boy',
        "Maybe I wouldn't be here now, scared of Keli"
    );
}

async function beWhenBoy(player, npc) {
    await npc.say(
        'Well, I loved to sit by the lake, with my toes in the water',
        'And shoot the fish with my bow and arrow'
    );

    await player.say('That was a strange hobby for a little boy');

    await npc.say(
        'It kept us from goblin hunting, which was what most boys did',
        'What are you here for?'
    );

    const choice = await player.ask(
        [
            'Chill out, I wont cause you trouble',
            'Tell me about the life of a guard',
            "I had better leave, I don't want trouble"
        ],
        false
    );

    switch (choice) {
        case 0: // chill out
            await player.say('Hey, chill out, I wont cause you trouble');
            await chillOut(player, npc);
            break;
        case 1: // life of a guard
            await player.say('Tell me about the life of a guard');
            await lifeOfAGuard(npc);
            break;
        case 2: // better leave
            await player.say("I had better leave, I don't want trouble");
            await betterLeave(npc);
            break;
    }
}

async function betterLeave(npc) {
    await npc.say(
        'Thanks I appreciate that',
        'Talking on duty can be punishable by having your mouth stitched up',
        'These are tough people, no mistake'
    );
}

async function chillOut(player, npc) {
    await player.say('I was just wondering what you do to relax');

    await npc.say(
        'You never relax with these people, but its a good career for a ' +
            'young man',
        'And some of the shouting I rather like',
        'RESISTANCE IS USELESS!'
    );

    const choice = await player.ask(
        [
            'So what do you buy with these great wages?',
            'Tell me about the life of a guard',
            'Would you be interested in making a little more money?'
        ],
        true
    );

    switch (choice) {
        // wages
        case 0: {
            await npc.say(
                'Really, after working here, theres only time for a drink or ' +
                    'three',
                'All of us guards go to the same bar, And drink ourselves ' +
                    'stupid',
                'Its what I enjoy these days, that fade into unconsciousness',
                "I can't resist the sight of a really cold beer"
            );

            const choice = await player.ask(
                [
                    'Tell me about the life of a guard',
                    'What did you want to be when you were a boy',
                    "I had better leave, I don't want trouble"
                ],
                true
            );

            switch (choice) {
                case 0: // life of a guard
                    await lifeOfAGuard(npc);
                    break;
                case 1: // boy
                    await beWhenBoy(player, npc);
                    break;
                case 2: // better leave
                    await betterLeave(npc);
                    break;
            }
            break;
        }
    }
}

async function giveBeer(player, npc) {
    await npc.say(
        'Ah, that would be lovely, just one now, just to wet my throat'
    );

    await player.say('Of course, it must be tough being here without a drink');

    // no delay here
    player.inventory.remove(BEER_ID);

    player.message(
        '@que@You hand a beer to the guard, he drinks it in seconds'
    );

    await npc.say('Thas was perfect, i cant thank you enough');

    if (player.inventory.has(BEER_ID, 2)) {
        await player.say('Would you care for another, my friend?');
        await npc.say("I better not, I don't want to be drunk on duty");

        await player.say(
            'Here, just keep these for later, I hate to see a thirsty guard'
        );

        player.inventory.remove(BEER_ID, 2);

        // also no delay
        player.message(
            '@que@You hand two more beers to the guard',
            '@que@he takes a sip of one, and then he drinks them both'
        );

        await npc.say(
            'Franksh, that wash just what I need to shtay on guard',
            "No more beersh, i don't want to get drunk"
        );

        player.message('@que@The guard is drunk, and no longer a problem');
        player.cache.joeDrunk = true;
    } else {
        await player.say('How are you? still ok. Not too drunk?');

        await npc.say(
            "No, I don't get drunk with only one drink",
            'You would need a few to do that, but thanks for the beer'
        );
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== JOE_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;
    const joeDrunk = !!player.cache.joeDrunk;

    player.engage(npc);

    if (joeDrunk) {
        await npc.say('Halt. Who goes there?');

        await player.say(
            'Hello friend, I am just rescuing the prince, is that ok?'
        );

        await npc.say(
            'Thatsh a funny joke. you are lucky I am shober',
            'Go in peace, friend'
        );
    } else if (!questStage || questStage > 0) {
        await npc.say("Hi, I'm Joe, door guard for Lady Keli");
        await player.say('Hi, who are you guarding here?');

        await npc.say(
            "Can't say, all very secret. you should get out of here",
            'I am not supposed to talk while I guard'
        );

        const choices = [
            'Hey, chill out, I wont cause you trouble',
            'Tell me about the life of a guard',
            'What did you want to be when you were a boy',
            "I had better leave, I don't want trouble"
        ];

        let offerBeer = false;

        if (questStage >= 3 && player.inventory.has(BEER_ID)) {
            choices[0] = 'I have some beer here, fancy one?';
            offerBeer = true;
        }

        const choice = await player.ask(choices, true);

        switch (choice) {
            case 0: // chill/beer
                if (offerBeer) {
                    await giveBeer(player, npc);
                } else {
                    await chillOut(player, npc);
                }
                break;
            case 1: // life of a guard
                await lifeOfAGuard(npc);
                break;
            case 2: // boy
                await beWhenBoy(player, npc);
                break;
            case 3: // better leave
                await betterLeave(npc);
                break;
        }
    } else if (questStage === -1) {
        await npc.say('Halt, who goes there? Friend or foe?');
        await player.say('Hi friend, I am just checking out things here');

        await npc.say(
            'The Prince got away, I am in trouble',
            'I better not talk to you, they are not sure I was drunk'
        );

        await player.say("I won't say anything, your secret is safe with me");
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
