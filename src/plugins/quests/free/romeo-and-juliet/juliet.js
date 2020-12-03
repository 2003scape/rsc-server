// https://classic.runescape.wiki/w/Transcript:Juliet

const CADAVA_POTION_ID = 57;
const JULIET_ID = 31;
const MESSAGE_ID = 56;

async function initiateQuest(player, npc) {
    await player.say('Certinly, I will deliver your message straight away');
    await npc.say('It may be our only hope');
    player.inventory.add(MESSAGE_ID);
    player.message('@que@Juliet gives you a message');
    player.questStages.romeoAndJuliet = 2;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== JULIET_ID) {
        return false;
    }

    const questStage = player.questStages.romeoAndJuliet;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'Romeo, Romeo, wherefore art thou Romeo?',
            'Bold adventurer, have you seen Romeo on your travels?',
            'Skinny guy, a bit wishy washy, head full of poetry'
        );

        const choice = await player.ask(
            [
                'Yes I have met him',
                'No, I think I would have remembered if I had',
                'I guess I could find him',
                'I think you could do better'
            ],
            false
        );

        switch (choice) {
            // yes
            case 0: {
                await player.say(
                    'I did see Romeo somewhere.',
                    'He seemed a bit depressed.'
                );

                await npc.say(
                    'Yes, that would be him.',
                    'Could you please deliver a messge to him?'
                );

                const choice = await player.ask(
                    [
                        'Certainly, I will do so straight away',
                        'No, he was a little too weird for me'
                    ],
                    false
                );

                switch (choice) {
                    case 0: // certainly
                        await initiateQuest(player, npc);
                        break;
                    case 1: // no
                        await player.say('No');

                        await npc.say(
                            'Oh dear, that will be the ruin of our love',
                            'Well, I will just stay here and worry',
                            'You unromantic soul.'
                        );
                        break;
                }
                break;
            }
            // no
            case 1: {
                await player.say('No, I think I would have remembered');
                await npc.say('Could you please deliver a message to him?');

                const choice = await player.ask(
                    [
                        'Certinly, I will do so straight away',
                        'No, I have better things to do'
                    ],
                    false
                );

                switch (choice) {
                    case 0: // certainly
                        await initiateQuest(player, npc);
                        break;
                    case 1: // no
                        await player.say('No, I have better things to do');
                        await npc.say('I will not keep you from them. Goodbye');
                        break;
                }
                break;
            }
            case 2: // find him
                await player.say('I guess I could find him');

                await npc.say(
                    'That is most kind of you',
                    'Could you please deliver a message to him?'
                );

                await initiateQuest(player, npc);
                break;
            case 3: // do better
                await player.say('I think you could do better');

                // absolute savagae
                await npc.say(
                    'He has his good points',
                    "He doesn't spend all day on the internet, at least"
                );
                break;
        }
    } else if (questStage === 1) {
        await player.say(
            'Juliet, I come from Romeo',
            'He begs me tell you he cares still'
        );

        await npc.say('Please, Take this message to him');
        await initiateQuest(player, npc);
    } else if (questStage === 2) {
        if (!player.inventory.has(MESSAGE_ID) && !player.bank.has(MESSAGE_ID)) {
            const lostMessages = player.cache.lostJulietMessages || 0;

            if (lostMessages === 0) {
                await npc.say(
                    'How could you lose this most important message?',
                    "Please take this message to him, and please don't lose it"
                );

                player.inventory.add(MESSAGE_ID);
                player.message('@que@Juliet gives you another message');
                player.cache.lostJulietMessages = 1;
            } else if (lostMessages === 1) {
                await npc.say(
                    'It seems I cannot trust you with a simple message',
                    'I am sorry, I need a more reliable messenger'
                );

                player.cache.lostJulietMessages = 2;
            } else if (lostMessages === 2) {
                await npc.say(
                    'I am sorry, I do need a more reliable messenger',
                    'Can you send any friends my way?',
                    'Preferably tall, dark and handsome',
                    'I am sorry, I need a more reliable messenger'
                );
            }
        } else {
            await npc.say(
                'Please, deliver the message to Romeo with all speed'
            );
        }
    } else if (questStage === 3) {
        await player.say(
            'I have passed on your message',
            'Now I go to Father Lawrence for help'
        );

        await npc.say(
            'Yes, he knows many things that can be done',
            'I hope you find him soon'
        );
    } else if (questStage === 4) {
        await player.say('I found the Father. Now I seek the apothecary');

        await npc.say(
            'I do not know where he lives',
            'but please, make haste. My father is close'
        );
    } else if (questStage === 5) {
        if (player.inventory.has(CADAVA_POTION_ID)) {
            const { world } = player;

            await player.say(
                'I have a potion from Father Lawrence',
                'it should make you seem dead, and get you away from this place'
            );

            player.inventory.remove(CADAVA_POTION_ID);
            player.message('@que@You pass the potion to Juliet');
            await world.sleepTicks(2);

            await npc.say(
                'Wonderful. I just hope Romeo can remember to get me from ' +
                    'the Crypt',
                'Many thanks kind friend',
                'Please go to Romeo, make sure he understands',
                'He can be a bit dense sometimes'
            );

            player.questStages.romeoAndJuliet = 6;
        } else {
            await player.say(
                'I have to get a potion made for you',
                'Not done that bit yet though. Still trying'
            );

            await npc.say('Fair luck to you, the end is close');
        }
    } else if (questStage === 6) {
        await npc.say(
            'Have you seen Romeo? He will reward you for your help',
            'He is the wealth in this story',
            'I am just the glamour'
        );
    } else if (questStage === -1) {
        await npc.say(
            'I sat in that cold crypt for ages waiting for Romeo',
            'That useless fool never showed up',
            'And all I got was indigestion. I am done with men like him',
            'Now go away before I call my father!'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
