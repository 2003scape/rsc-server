// https://classic.runescape.wiki/w/Transcript:Straven

const DOOR_ID = 19;
const SCROLL_ID = 49;
const STRAVEN_ID = 24;
const WEAPONS_STORE_KEY_ID = 48;

async function blackArmDog(player, npc) {
    await npc.say('hey get away from there', 'Black arm dog');
    player.disengage();
    player.lock();
    await npc.attack(player);
}

async function offerMyServices(player, npc) {
    await npc.say(
        "You mean you'd like to join the phoenix gang?",
        "Well the phoenix gang doesn't let people join just like that",
        "You can't be too careful, you understand",
        'Generally someone has to prove their loyalty before they can join'
    );

    await player.say('How would I go about this?');

    await npc.say(
        'Let me think',
        'I have an idea',
        'A rival gang of ours',
        'Called the black arm gang',
        'Is meant to be meeting their contact from Port Sarim today',
        'In the blue moon inn',
        'the south entrance to this city',
        'The name of this contact is Jonny the beard',
        'Kill him and bring back his intelligence report'
    );

    await player.say("Ok, I'll get on it");

    player.cache.phoenixStage = 2;
}

async function cantGoThere(player, npc) {
    const phoenixStage = player.cache.phoenixStage || 0;

    await npc.say(
        "Heh you can't go in there",
        'Only authorised personnel of the VTAM corporation are allowed ' +
            'beyond this point'
    );

    const choices = [
        'How do I get a job with the VTAM corporation?',
        'Why not?'
    ];

    if (phoenixStage === 1) {
        choices.unshift('I know who you are');
    }

    let choice = await player.ask(choices, true);

    if (phoenixStage !== 1) {
        choice += 1;
    }

    switch (choice) {
        // i know who you are
        case 0: {
            await npc.say('I see', 'Carry on');

            await player.say(
                'This is the headquarters of the Phoenix Gang',
                'The most powerful crime gang this city has seen'
            );

            await npc.say(
                'And supposing we were this crime gang',
                'What would you want with us?'
            );

            const choice = await player.ask(
                [
                    "I'd like to offer you my services",
                    'I want nothing. I was just making sure you were them'
                ],
                true
            );

            switch (choice) {
                case 0: // offer my services
                    await offerMyServices(player, npc);
                    break;
                case 1: // nothing
                    await npc.say('Well stop wasting my time');
                    break;
            }
            break;
        }
        case 1: // get a job
            await npc.say(
                'Get a copy of the Varrock Herald',
                'If we have any positions right now',
                "They'll be advertised in there"
            );
            break;
        case 2: // why not
            await npc.say('Sorry that is classified information');
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== STRAVEN_ID) {
        return false;
    }

    const blackArmStage = player.cache.blackArmStage || 0;
    const phoenixStage = player.cache.phoenixStage || 0;

    player.engage(npc);

    if (blackArmStage === -1) {
        await blackArmDog(player, npc);
        return true;
    }

    if (!phoenixStage || phoenixStage === 1) {
        await player.say("What's through that door?");
        await cantGoThere(player, npc);
    } else if (phoenixStage === 2) {
        await npc.say('Hows your little mission going?');

        if (player.inventory.has(SCROLL_ID)) {
            const { world } = player;

            await player.say('I have the intelligence report');
            await npc.say('Lets see it then');

            player.inventory.remove(SCROLL_ID);
            player.message('@que@You hand over the report');
            await world.sleepTicks(3);

            player.message('@que@The man reads the report');
            await world.sleepTicks(3);

            await npc.say(
                'Yes this is very good',
                'Ok you can join the phoenix gang',
                'I am Straven, one of the gang leaders'
            );

            await player.say('Nice to meet you');
            await npc.say('Here is a key');

            player.inventory.add(WEAPONS_STORE_KEY_ID);
            player.message('@que@Straven hands you a key');
            await world.sleepTicks(3);

            await npc.say(
                'It will let you enter our weapon supply area',
                'Round the front of this building'
            );

            delete player.cache.blackArmStage;
            player.cache.phoenixStage = -1;
        } else {
            await player.say("I haven't managed to find the report yet");

            await npc.say(
                'You need to kill Jonny the beard',
                'Who should be in the blue moon inn'
            );
        }
    } else if (phoenixStage === -1) {
        await npc.say('Greetings fellow gang member');

        if (!player.inventory.has(WEAPONS_STORE_KEY_ID)) {
            await player.say('I have lost the key you gave me');

            await npc.say(
                'You need to be more careful',
                "We don't want that falling into the wrong hands",
                'Ah well',
                'Have this spare'
            );

            player.inventory.add(WEAPONS_STORE_KEY_ID);
        } else {
            const choice = await player.ask(
                [
                    "I've heard you've got some cool treasure in this place",
                    'Any suggestions for where I can go thieving?',
                    "Where's the Blackarm gang hideout?"
                ],
                true
            );

            switch (choice) {
                case 0: // treasure
                    await npc.say(
                        "Oh yeah, we've all stolen some stuff in our time",
                        'The candlesticks down here',
                        'Were quite a challenge to get out the palace'
                    );

                    await player.say(
                        'And the shield of Arrav',
                        'I heard you got that'
                    );

                    await npc.say(
                        'hmm',
                        'That was a while ago',
                        "We don't even have all the shield anymore",
                        'About 5 years ago',
                        'We had a massive fight in our gang',
                        'The shield got broken in half during the fight',
                        'Shortly after the fight',
                        'Some gang members decided',
                        "They didn't want to be part of our gang anymore",
                        'So they split off to form their own gang',
                        'The black arm gang',
                        'On their way out',
                        'They looted what treasures they could from us',
                        'Which included one of the halves of the shield',
                        "We've been rivals with the black arms ever since"
                    );
                    break;
                case 1: // thieving suggestions
                    await npc.say(
                        'You can always try the market',
                        'Lots of opportunity there'
                    );
                    break;
                case 2: // blackarm hideout
                    await player.say('I wanna go sabotage em');

                    await npc.say(
                        'That would be a little tricky',
                        'Their security is pretty good',
                        'Not as good as ours obviously',
                        'But still good',
                        'If you really want to go there',
                        'It is in the alleyway',
                        'To the west as you come in the south gate',
                        'One of our operatives is often near the alley',
                        'A red haired tramp',
                        'He may be able to give you some ideas'
                    );

                    await player.say('Thanks for the help');
                    break;
            }
        }
    }

    player.disengage();
    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const { world } = player;
    const blackArmStage = player.cache.blackArmStage || 0;
    const phoenixStage = player.cache.phoenixStage || 0;

    if (blackArmStage === -1) {
        const straven = world.npcs.getByID(STRAVEN_ID);

        if (straven && !straven.locked) {
            player.engage(straven);
            await blackArmDog(player, straven);
        }
    } else if (phoenixStage === -1) {
        player.message('The door is opened for you', 'You go through the door');
        await player.enterDoor(wallObject);
    } else {
        const straven = world.npcs.getByID(STRAVEN_ID);

        if (straven && !straven.locked) {
            if (phoenixStage >= 1) {
                return await onTalkToNPC(player, straven);
            } else {
                player.engage(straven);
                await cantGoThere(player, straven);
                player.disengage();
            }
        }
    }

    return true;
}

module.exports = { onTalkToNPC, onWallObjectCommandOne };
