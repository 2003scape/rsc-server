// https://classic.runescape.wiki/w/Transcript:Gypsy
// (she's 56)

const GYPSY_ID = 14;
const SILVERLIGHT_ID = 52;

async function stopCallingMeThat(player, npc) {
    await npc.say('In the scheme of things you are very young');

    const choice = await player.ask(
        [
            'Ok but how old are you',
            "Oh if its in the scheme of things that's ok"
        ],
        true
    );

    switch (choice) {
        case 0: // how old are you
            await howOldAreYouCount(player, npc);
            break;
        case 1: // that's ok
            await npc.say('You show wisdom for one so young');
            break;
    }
}

async function dontBelieve(npc) {
    await npc.say('Ok suit yourself');
}

async function stopTheDemon(npc) {
    await npc.say('Good luck, may Guthix be with you');
}

async function findSilverlight(player, npc) {
    await npc.say(
        "Silverlight has been passed down through Wally's descendents",
        "I believe it is currently in the care of one of the king's knights",
        'called Sir Prysin',
        "He shouldn't be to hard to find the he lives in the royal palace in " +
            'this city',
        'Tell him Gypsy Aris sent you'
    );

    const choice = await player.ask(
        [
            "Ok thanks I'll do my best to stop the Demon",
            'What is the magical incantation?'
        ],
        true
    );

    switch (choice) {
        case 0: // stop the demon
            await stopTheDemon(npc);
            break;
        case 1: // incantation
            await incantation(player, npc);
            break;
    }
}

async function incantation(player, npc) {
    const { world } = player;

    await npc.say('Oh yes let me think a second');
    player.message('@que@The gypsy is thinking');
    await world.sleepTicks(3);

    await npc.say(
        "Alright I've got it now I think",
        'It goes',
        'Carlem',
        'Aber',
        'Camerinthum',
        'Purchai',
        'Gabindo',
        'Have you got that?'
    );

    await player.say('I think so, yes');

    const choice = await player.ask(
        [
            "Ok thanks I'll do my best to stop the Demon",
            'Where can I find Silverlight?'
        ],
        true
    );

    switch (choice) {
        case 0: // stop the demon
            await stopTheDemon(npc);
            break;
        case 1: // find silverlight
            await findSilverlight(player, npc);
            break;
    }
}

async function defeatDelrith(player, npc) {
    await npc.say(
        'Wally managed to arrive at the stone circle',
        'Just as Delrith was summoned by a cult of chaos druids',
        'By reciting the correct magical incantation',
        'and thrusting Silverlight into Delright, while he was newly summoned',
        'Wally was able to imprison Delrith',
        'in the stone block in the centre of the circle',
        'Delrith will come forth from the stone circle again',
        'I would imagine an evil sorcerer is already starting on the rituals',
        'To summon Delrith as we speak'
    );

    const choice = await player.ask(
        ['What is the magical incantion?', 'Where can I find Silverlight?'],
        true
    );

    switch (choice) {
        case 0: // what is incantation
            await incantation(player, npc);
            break;
        case 1: // find silverlight
            await findSilverlight(player, npc);
            break;
    }
}

async function wallyUnheroic(player, npc) {
    await npc.say(
        "Yes I know. Maybe that is why history doesn't remember him",
        'However he was a very great hero.',
        'Who knows how much pain and suffering',
        'Delrith would have brought forth without Wally to stop him',
        'It looks like you are going to need to perform similar heroics'
    );

    const choice = await player.ask(
        [
            'How am I meant to fight a demon who can destroy cities?',
            "Ok where is he? I'll kill him for you"
        ],
        true
    );

    switch (choice) {
        case 0: // destroy cities
            await npc.say("I admit it won't be easy");
            await defeatDelrith(player, npc);
            break;
        case 1: // kill him for you
            await npc.say(
                "Well you can't just go and fight",
                "He can't be harmed by ordinary weapons"
            );

            await defeatDelrith(player, npc);
            break;
    }
}

async function fortuneTold(player, npc) {
    if (player.inventory.has(10)) {
        player.inventory.remove(10);

        await npc.say(
            'Come closer',
            'And listen carefully to what the future holds for you',
            'As I peer into the swirling mists of the crystal ball',
            'I can see images forming',
            'I can see you',
            'You are holding a very impressive looking sword',
            "I'm sure I recognise that sword",
            'There is a big dark shadow appearing now',
            'Aaargh'
        );

        // it doesn't matter which they pick - but thou must
        await player.ask(
            [
                'Very interesting what does the Aaargh bit mean?',
                'Are you alright?',
                'Aaargh?'
            ],
            true
        );

        player.questStages.demonSlayer = 1;

        await npc.say('Aaargh its Delrith', 'Delrith is coming');

        let choice = await player.ask(["Who's Delrith?", 'Get a grip!'], false);

        // get a grip
        if (choice === 1) {
            await player.say('Get a grip!');

            await npc.say(
                "Sorry. I didn't expect to see Delrith",
                'I had to break away quickly in case he detected me'
            );
        }

        await player.say("Who's Delrith?");

        await npc.say(
            'Delrith',
            'Delrtih is a powerfull demon',
            "Oh I really hope he didn't see me",
            'Looking at him through my crystal ball',
            'He tried to destroy this city 150 years ago',
            'He was stopped just in time, by the great hero Wally',
            'Wally managed to trap the demon',
            'In the stone circle just south of this city',
            'Using his magic sword silverlight',
            'Ye Gods',
            'Silverlight was the sword you were holding the ball vision',
            'You are the one destined to try and stop the demon this time '
        );

        choice = await player.ask(
            [
                'How am I meant to fight a demon who can destroy cities?',
                "Ok where is he? I'll kill him for you",
                "Wally doesn't sound like a very heroic name"
            ],
            true
        );

        switch (choice) {
            case 0: // destroy cities
                await npc.say("I admit it won't be easy");
                await defeatDelrith(player, npc);
                break;
            case 1: // kill him for you
                await npc.say(
                    "Well you can't just go and fight",
                    "He can't be harmed by ordinary weapons"
                );

                await defeatDelrith(player, npc);
                break;
            case 2: // wally
                await wallyUnheroic(player, npc);
                break;
        }
    } else {
        await player.say("Oh dear. I don't have any money");
    }
}

async function howOldAreYouCount(player, npc) {
    await npc.say(
        'Count the number of legs of the chairs in the blue moon inn',
        'And multiply that number by seven'
    );

    await player.say('Errr yeah whatever');
}

async function howOldAreYou(player, npc) {
    await npc.say('Older than you imagine');

    const choice = await player.ask(
        [
            'Believe me, I have a good imagination',
            'How do you know how old I think you are?',
            'Oh pretty old then'
        ],
        true
    );

    switch (choice) {
        // imagination
        case 0: {
            await npc.say(
                'You seem like just the sort of person',
                'Who would want their fortune told then'
            );

            const choice = await player.ask(
                ["No, I don't believe in that stuff", 'Yes please'],
                true
            );

            switch (choice) {
                case 0: // don't believe
                    await dontBelieve(npc);
                    break;
                case 1: // yes
                    await fortuneTold(player, npc);
                    break;
            }
            break;
        }
        case 1: {
            // how do you know?
            await npc.say(
                'I have the power to know',
                'Just as I have the power to foresee the future'
            );

            const choice = await player.ask(
                [
                    'Ok what am I thinking now?',
                    'Ok but how old are you?',
                    "Go on then, what's my future?"
                ],
                true
            );

            switch (choice) {
                case 0: // thinking now
                    await npc.say(
                        "You are thinking that I'll never guess what you are " +
                            'thinking'
                    );
                    break;
                case 1: // how old are you
                    await howOldAreYouCount(player, npc);
                    break;
                // what's my future
                case 2: {
                    await npc.say(
                        "Cross my palm with silver and I'll tell you"
                    );

                    const choice = await player.ask(
                        ['Ok here you go', 'Oh you want me to pay. No thanks'],
                        true
                    );

                    switch (choice) {
                        case 0: // ok here
                            await fortuneTold(player, npc);
                            break;
                        case 1: // no thanks
                            await npc.say('Go away then');
                            break;
                    }
                    break;
                }
            }
            break;
        }
        case 2: // pretty old
            await npc.say("Yes I'm old", "Don't rub it in");
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== GYPSY_ID) {
        return false;
    }

    const questStage = player.questStages.demonSlayer;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'Hello, young one',
            'Cross my palm with silver and the future will be revealed to you'
        );

        const choice = await player.ask(
            [
                'Ok, here you go',
                'Who are you calling young one?!',
                "No, I don't believe in that stuff"
            ],
            true
        );

        switch (choice) {
            case 0: // ok
                await fortuneTold(player, npc);
                break;
            // young one
            case 1: {
                await npc.say(
                    'You have been on this world',
                    'A relatively short time',
                    'At least compared to me',
                    'So do you want your fortune told or not?'
                );

                const choice = await player.ask(
                    [
                        'Yes please',
                        "No, I don't believe in that stuff",
                        'Ooh how old are you then?'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // yes
                        await fortuneTold(player, npc);
                        break;
                    case 1: // no
                        await dontBelieve(npc);
                        break;
                    case 2: // how old are you?
                        await howOldAreYou(player, npc);
                        break;
                }
                break;
            }
            case 2: // no
                await dontBelieve(npc);
                break;
        }
    } else if (questStage === 1) {
        await npc.say('Greetings how goes thy quest?');
        await player.say("I'm still working on it");
        await npc.say("Well if you need any advice I'm always here young one");

        const choice = await player.ask(
            [
                'What is the magical incanation?',
                'Where can I find Silverlight?',
                "Well I'd better press on with it",
                'Stop calling me that'
            ],
            true
        );

        switch (choice) {
            case 0: // incantation
                await incantation(player, npc);
                break;
            case 1: // find silverlight
                await findSilverlight(player, npc);
                break;
            case 2: // press on
                await npc.say('See you anon');
                break;
            case 3: // stop calling me that
                await stopCallingMeThat(player, npc);
                break;
        }
    } else if (questStage === 2) {
        await npc.say('How goes the quest?');

        if (player.inventory.has(SILVERLIGHT_ID)) {
            await player.say(
                'I have the sword, now. I just need to kill the demon I think'
            );

            await npc.say("Yep, that's right");
        } else {
            await player.say(
                "I found Sir Prysin. Unfortunately, I haven't got the sword " +
                    'yet',
                "He's made it complicated for me!"
            );

            await npc.say("Ok, hurry, we haven't much time");
        }
    } else if (questStage === -1) {
        await npc.say(
            'Greetings young one',
            "You're a hero now",
            'That was a good bit of demonslaying'
        );

        const choice = await player.ask(
            ['How do you know I killed it?', 'Thanks', 'Stop calling me that'],
            true
        );

        switch (choice) {
            case 0: // how do you know?
                await npc.say('You forget', "I'm good at knowing these things");
                break;
            case 2: // stop calling me that
                await stopCallingMeThat(player, npc);
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
