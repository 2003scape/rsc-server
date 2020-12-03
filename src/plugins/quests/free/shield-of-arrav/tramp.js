// https://classic.runescape.wiki/w/Transcript:Tramp

const TRAMP_ID = 28;

async function alleyway(player, npc) {
    const blackArmStage = player.cache.blackArmStage || 0;
    const phoenixStage = player.cache.phoenixStage || 0;

    await npc.say(
        'Yes there is actually',
        'A notorious gang of thieves and hoodlums',
        'Called the blackarm gang'
    );

    const choice = await player.ask(
        ['Thanks for the warning', 'Do you think they would let me join?'],
        true
    );

    switch (choice) {
        case 0: // thanks for warning
            await npc.say("Don't worry about it");
            break;
        case 1: // let me join
            if (blackArmStage === -1) {
                await npc.say(
                    'I was under the impression you were already a member'
                );
            } else if (phoenixStage === -1) {
                await npc.say(
                    'No',
                    "You're a collaborator with the phoenix gang",
                    "There's no way they'll let you join"
                );

                const choice = await player.ask(
                    [
                        'How did you know I was in the phoenix gang?',
                        'Any ideas how I could get in there then?'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // how did you know
                        await npc.say(
                            'I spend a lot of time on the streets',
                            'And you hear those sorta things sometimes'
                        );
                        break;
                    // how to get in there
                    case 1: {
                        await npc.say(
                            'Hmm I dunno',
                            'Your best bet would probably be to get someone ' +
                                'else',
                            "Someone who isn't a member of the phoenix gang",
                            'To Infiltrate the ranks of the black arm gang',
                            'If you find someone',
                            'Tell em to come to me first'
                        );

                        const choice = await player.ask(
                            ['Ok good plan', 'Like who?'],
                            true
                        );

                        if (choice === 1) {
                            await npc.say(
                                "There's plenty of other adventurers about",
                                'Besides yourself',
                                "I'm sure if you asked one of them nicely",
                                'They would help you'
                            );
                        }
                        break;
                    }
                }
            } else {
                await npc.say(
                    'You never know',
                    "You'll find a lady down there called Katrine",
                    'Speak to her',
                    "But don't upset her, she's pretty dangerous"
                );

                if (!player.cache.blackArmStage) {
                    player.cache.blackArmStage = 1;
                }
            }
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== TRAMP_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Spare some change guv?');

    const choice = await player.ask(
        [
            "Sorry I haven't got any",
            'Go get a job',
            'Ok here you go',
            'Is there anything down this alleyway'
        ],
        true
    );

    switch (choice) {
        case 0: // haven't got any
            await npc.say('Thanks anyway');
            break;
        case 1: // get a job
            await npc.say('You startin?');
            break;
        // here you go
        case 2: {
            if (player.inventory.has(10)) {
                player.inventory.remove(10);
            }

            await npc.say('Thankyou, thats great');

            const choice = await player.ask(
                [
                    'No problem',
                    "So don't I get some sort of quest hint or something now"
                ],
                true
            );

            if (choice === 1) {
                await npc.say(
                    "No that's not why I'm asking for money",
                    'I just need to eat'
                );
            }
            break;
        }
        case 3: // anything down this alleyway
            await alleyway(player, npc);
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
