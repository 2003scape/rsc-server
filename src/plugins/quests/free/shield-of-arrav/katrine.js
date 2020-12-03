// https://classic.runescape.wiki/w/Transcript:Katrine

const KATRINE_ID = 27;
const PHOENIX_CROSSBOW_ID = 59;

async function stealCrossbow(player, npc) {
    await npc.say(
        'I think I may have a solution actually',
        'Our rival gang - the phoenix gang',
        'Has a weapons stash a little east of here',
        "We're fresh out of crossbows",
        'So if you could steal a couple of crossbows for us',
        'That would be very much appreciated',
        "Then I'll be happy to call you a black arm"
    );

    const choice = await player.ask(
        ['Ok no problem', 'Sounds a little tricky got anything easier?'],
        true
    );

    switch (choice) {
        case 0: // no problem
            player.cache.blackArmStage = 2;
            break;
        case 1: // tricky
            await npc.say(
                "If you're not up for a little bit of danger",
                "I don't think you've got anything to offer our gang"
            );
            break;
    }
}

async function whatDoYouWant(player, npc) {
    const choice = await player.ask(
        [
            'I want to become a member of your gang',
            'I want some hints for becoming a thief',
            "I'm looking for the door out of here"
        ],
        false
    );

    switch (choice) {
        // become a member
        case 0: {
            await player.say('I want to become a member of your gang');

            await npc.say(
                'How unusual',
                'Normally we recruit for our gang',
                'By watching local thugs and thieves in action',
                "People don't normally waltz in here",
                "Saying 'hello can I play'",
                'How can I be sure you can be trusted?'
            );

            const choice = await player.ask(
                [
                    "Well you can give me a try, can't you?",
                    'Well people tell me I have an honest face'
                ],
                true
            );

            switch (choice) {
                case 0: // give me a try
                    await npc.say("I'm not so sure");
                    await stealCrossbow(player, npc);
                    break;
                case 1: // honest face
                    await npc.say(
                        'How unusual someone honest wanting to join a gang ' +
                            'of thieves',
                        'Excuse me if i remain unconvinced'
                    );

                    await stealCrossbow(player, npc);
                    break;
            }
            break;
        }
        case 1: // hints
            await player.say('I want some hints for becomming a thief');

            await npc.say(
                "Well I'm sorry luv",
                "I'm not giving away my secrets",
                'Not to none black arm members anyway'
            );
            break;
        case 2: // door out of here
            await player.say("I'm looking for the door out of here");
            player.message('Katrine groans');
            await npc.say('Try the one you just came in');
            break;
    }
}

async function heardYoureBlackarm(player, npc) {
    await npc.say('Who told you that?');

    const choice = await player.ask(
        [
            "I'd rather not reveal my sources",
            'It was the tramp outside',
            'Everyone knows - its no great secret'
        ],
        false
    );

    switch (choice) {
        case 0: // not reveal
            await player.say("I'd rather not reveal my sources");

            await npc.say(
                'Yes, I can understand that',
                'So what do you want with us?'
            );

            await whatDoYouWant(player, npc);
            break;
        case 1: // tramp outside
            await player.say('It was the tramp outside');

            await npc.say(
                'Is that guy still out there?',
                "He's getting to be a nuisance",
                'Remind me to send someone to kill him',
                "So now you've found us",
                'What do you want?'
            );

            await whatDoYouWant(player, npc);
            break;
        case 2: // everyone knows
            await player.say('Everyone knows', "It's no great secret");
            await npc.say('I thought we were safe back here');

            await player.say(
                'Oh no, not at all',
                "It's so obvious",
                'Even the town guard have caught on'
            );

            await npc.say(
                'Wow we must be obvious',
                "I guess they'll be expecting bribes again soon in that case",
                'Thanks for the information',
                'Is there anything else you want to tell me?'
            );

            await whatDoYouWant(player, npc);
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== KATRINE_ID) {
        return false;
    }

    const { blackArmStage, phoenixStage } = player.cache;

    player.engage(npc);

    if (phoenixStage === -1) {
        await npc.say("You've got some guts coming here", 'Phoenix guy');
        player.message('Katrine spits');

        await npc.say(
            'Now go away',
            "Or I'll make sure you 'aven't got those guts anymore"
        );
    } else if (blackArmStage === -1) {
        await player.say('Hey');
        await npc.say('Hey');

        const choice = await player.ask(
            [
                'Who are all those people in there?',
                'Teach me to be a top class criminal'
            ],
            true
        );

        switch (choice) {
            case 0: // who are these people
                await npc.say("They're just various rogues and thieves");
                await player.say("They don't say a lot");
                await npc.say('Nope');
                break;
            case 1: // teach me
                await npc.say('Teach yourself');
                break;
        }
    } else if (blackArmStage === 2) {
        await npc.say('Have you got those crossbows for me yet?');

        if (player.inventory.has(PHOENIX_CROSSBOW_ID, 2)) {
            await player.say('Yes I have');

            player.inventory.remove(PHOENIX_CROSSBOW_ID, 2);

            await npc.say(
                'Ok you can join our gang now',
                'Feel free to enter any the rooms of the ganghouse'
            );

            player.cache.blackArmStage = -1;
        } else if (player.inventory.has(PHOENIX_CROSSBOW_ID)) {
            await player.say('I have one');
            await npc.say('I need two', 'Come back when you have them');
        } else {
            await player.say("No I haven't found them yet");

            await npc.say(
                'I need two crossbows',
                'Stolen from the phoenix gang weapons stash',
                'which if you head east for a bit',
                'Is a building on the south side of of the road'
            );
        }
    } else if (blackArmStage === 1 || !blackArmStage) {
        await player.say('What is this place?');
        await npc.say("It's a private business", 'Can I help you at all?');

        const choices = [
            'What sort of business',
            "I'm looking for fame and riches"
        ];

        if (blackArmStage === 1) {
            choices.unshift("I've heard you're the blackarm gang");
        }

        let choice = await player.ask(choices, true);

        if (blackArmStage !== 1) {
            choice += 1;
        }

        switch (choice) {
            case 0: // heard you're blackarm
                await heardYoureBlackarm(player, npc);
                break;
            case 1: // sort of business
                await npc.say(
                    'A small family business',
                    'We give financial advice to other companies'
                );
                break;
            case 2: // fame and riches
                await npc.say(
                    'And you expect to find it up the backstreets of Varrock?'
                );
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
