// https://classic.runescape.wiki/w/Transcript:Captain_Rovin

const CAPTAIN_ROVIN_ID = 18;
const ROVIN_KEY_ID = 26;

async function onTalkToNPC(player, npc) {
    if (npc.id !== CAPTAIN_ROVIN_ID) {
        return false;
    }

    const questStage = player.questStages.demonSlayer;

    player.engage(npc);

    await npc.say(
        'What are you doing up here?',
        'Only the palace guards are allowed up here'
    );

    const choice = await player.ask(
        [
            'I am one of the palace guards',
            'What about the king?',
            'Yes I know but this important'
        ],
        true
    );

    switch (choice) {
        case 0: {
            // i am a guard
            await npc.say("No you're not. I know all the palace guards");

            const choice = await player.ask(
                ["I'm a new recruit", "I've had extensive plastic surgery"],
                true
            );

            switch (choice) {
                case 0: // new recruit
                    await npc.say(
                        'I interview all the new recruits',
                        "I'd know if you were one of them"
                    );

                    await player.say(
                        'That blows my story out of the window then'
                    );

                    await npc.say('Get out of my sight');
                    break;
                case 1: // plastic surgery
                    await npc.say(
                        'What kind of surgery is that?',
                        'Never heard of it',
                        'Besides, you look reasonably healthy',
                        'Why is this relevant anyway?',
                        "You still shouldn't be here"
                    );
                    break;
            }
            break;
        }
        case 1: // king
            await player.say("Surely you'd let him up here?");

            await npc.say(
                "Well, yes, I suppose we'd let him up",
                "He doesn't generally want to come up here",
                'But if he did want to',
                'He could come up',
                "Anyway, you're not the king either",
                'So get out of my sight'
            );
            break;
        case 2: {
            // important
            await npc.say("Ok, I'm listening", "Tell me what's so important");

            const choices = [
                'Erm I forgot',
                "The castle has just received it's ale delivery"
            ];

            if (questStage === 2) {
                choices.unshift(
                    "There's a demon who wants to invade this city"
                );
            }

            let choice = await player.ask(choices, true);

            if (questStage !== 2) {
                choice += 1;
            }

            switch (choice) {
                case 0: // demon
                    await npc.say('Is it a powerful demon?');
                    await player.say('Yes, very');

                    await npc.say(
                        'Well as good as the palace guards are',
                        "I don't think they're up to taking on a very " +
                            'powerful demon'
                    );

                    await player.say(
                        "No no, it's not them who's going to fight the demon",
                        "It's me"
                    );

                    await npc.say('What all by yourself?');

                    await player.say(
                        'Well I am going to use the powerful sword silverlight',
                        'Which I believe you have one of the keys for'
                    );

                    await npc.say("Yes you're right", 'Here you go');

                    player.inventory.add(ROVIN_KEY_ID);
                    player.message('@que@Captain Rovin hands you a key');
                    break;
                case 1: // forgot
                    await npc.say("Well it can't be that important then");
                    await player.say('How do you know?');
                    await npc.say('Just go away');
                    break;
                case 2: // ale delivery
                    await npc.say(
                        'Now that is important',
                        "However, I'm the wrong person to speak to about it",
                        'Go talk to the kitchen staff'
                    );
                    break;
            }
            break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
