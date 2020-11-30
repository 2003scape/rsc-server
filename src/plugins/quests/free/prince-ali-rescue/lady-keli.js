// https://classic.runescape.wiki/w/Transcript:Lady_Keli

const KEYPRINT_ID = 247;
const LADY_KELI_ID = 123;
const ROPE_ID = 237;
const SOFT_CLAY_ID = 243;

async function katrineTougher(player, npc) {
    await player.say('I think Katrine is still tougher');

    await npc.say(
        'Well you can think that all you like',
        'I know those blackarm cowards dare not leave the city',
        'Out here, I am toughest. You can tell them that!',
        'Now get out of my sight, before I call my guards'
    );
}

async function willTheyPay(player, npc) {
    await player.say('Are you sure they will pay?');

    await npc.say(
        'They will pay, or we will cut his hair off and send it to them'
    );

    await player.say(
        "Don't you think that something tougher, maybe cut his finger off?"
    );

    await npc.say(
        'Thats a good idea. I could use talented people like you',
        'I may call on you if I need work doing'
    );
}

async function getHimOut(player, npc) {
    await player.say('Can you be sure they will not try to get him out?');

    await npc.say(
        'There is no way to release him',
        'The only key to the door is on a chain around my neck',
        'And the locksmith who made the lock,',
        'died suddenly when he had finished',
        'There is not another key like this in the world'
    );

    const choice = await player.ask(
        [
            'Could I see the key please',
            'That is a good way to keep secrets',
            'I should not disturb someone as tough as you'
        ],
        false
    );

    const questStage = player.questStages.princeAliRescue;

    switch (choice) {
        case 0: // see the key
            await player.say(
                'Could I see the key please, just for a moment',
                'It would be something I can tell my grandchildren',
                'When you are even more famous than you are now'
            );

            await npc.say(
                'As you put it that way, I am sure you can see it',
                'You cannot steal the key, it is on an Adamantite chain',
                'I cannot see the harm'
            );

            player.message(
                'Keli shows you a small key on a stronglooking chain'
            );

            if (questStage === 2 && player.inventory.has(SOFT_CLAY_ID)) {
                const { world } = player;

                const choice = await player.ask(
                    [
                        'Could I touch the key for a moment please',
                        'I should not disturb someone as tough as you'
                    ],
                    false
                );

                switch (choice) {
                    case 0: // touch
                        await player.say(
                            'Could I touch the key for a moment please'
                        );

                        await npc.say('Only for a moment then');

                        player.message(
                            '@que@You put a piece of your soft clay in your ' +
                                'hand'
                        );

                        await world.sleepTicks(3);

                        player.message(
                            '@que@As you touch the key, you take an imprint ' +
                                'of it'
                        );

                        await world.sleepTicks(3);

                        player.inventory.remove(SOFT_CLAY_ID);
                        player.inventory.add(KEYPRINT_ID);

                        await player.say(
                            'Thankyou so much, you are too kind, o great Keli'
                        );

                        await npc.say('There, run along now, I am very busy');
                        break;
                    case 1: // do not disturb
                        await doNotDisturb(player, npc);
                        break;
                }
            } else {
                await npc.say('There, run along now, I am very busy');
            }
            break;
        case 1: // keep secrets
            await player.say('That is a good way to keep secrets');

            await npc.say(
                'It is the best way I know',
                'Dead men tell no tales'
            );

            await player.say('I am glad I know none of your secrets, Keli');
            break;
        case 2: // do not disturb
            await doNotDisturb(player, npc);
            break;
    }
}

async function latestPlan(player, npc) {
    await player.say(
        'What is your latest plan then?',
        'Of course you need not go into specific details'
    );

    await npc.say(
        'Well, I can tell you, I have a valuable prisoner here in my cells',
        'I can expect a high reward to be paid very soon for this guy',
        "I can't tell you who he is, but he is a lot colder now"
    );

    const choice = await player.ask(
        [
            'Ah, I see. You must have been very skilful',
            'Thats great, are you sure they will pay?',
            'Can you be sure they will not try to get him out?',
            'I should not disturb someone as tough as you'
        ],
        false
    );

    switch (choice) {
        // skillful
        case 0: {
            await player.say('You must have been very skilful');

            await npc.say(
                'Yes, I did most of the work, we had to grab the Pr...',
                'er, we had to grab him under cover of ten of his bodyguards',
                'It was a stronke of genius'
            );

            const choice = await player.ask(
                [
                    'Are you sure they will pay?',
                    'Can you be sure they will not try to get him out?',
                    'I should not disturb someone as tough as you'
                ],
                false
            );

            switch (choice) {
                case 0: // will they pay?
                    await willTheyPay(player, npc);
                    break;
                case 1: // get him out?
                    await getHimOut(player, npc);
                    break;
                case 2: // do not disturb
                    await doNotDisturb(player, npc);
                    break;
            }
            break;
        }
        case 1: // will they pay?
            await willTheyPay(player, npc);
            break;
        case 2: // get him out?
            await getHimOut(player, npc);
            break;
        case 3: // do not disturb
            await doNotDisturb(player, npc);
            break;
    }
}

async function trainedALot(player, npc) {
    await player.say('You must have trained a lot for this work');

    await npc.say(
        'I have used a sword since I was a small girl',
        'stabbed three people before I was 6 years old'
    );
}

async function doNotDisturb(player, npc) {
    await player.say('I should not disturb someone as tough as you');

    await npc.say(
        'I need to do a lot of work, goodbye',
        'When you get a little tougher, maybe I will give you a job'
    );
}

async function promptDiscussion(player, npc) {
    const choice = await player.ask(
        [
            'I think Katrine is still tougher',
            'What is your latest plan then?',
            'You must have trained a lot for this work',
            'I should not disturb someone as tough as you'
        ],
        false
    );

    switch (choice) {
        case 0: // katrine tougher
            await katrineTougher(player, npc);
            break;
        case 1: // latest plan
            await latestPlan(player, npc);
            break;
        case 2: // trained
            await trainedALot(player, npc);
            break;
        case 3: // disturb
            await doNotDisturb(player, npc);
            break;
    }
}

async function heardOfYou(player, npc) {
    await player.say(
        'The great Lady Keli, of course I have heard of you',
        'You are famous in Runescape!'
    );

    await npc.say(
        'Thats very kind of you to say. Reputation are not easily earnt',
        'I have managed to succeed where many fail'
    );

    await promptDiscussion(player, npc);
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== LADY_KELI_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    player.engage(npc);

    if (questStage !== -1 && questStage !== 4) {
        await player.say(
            'Are you the famous Lady Keli?',
            'Leader of the toughest gang of mercenary killers around?'
        );

        await npc.say('I am Keli, you have heard of me then');

        const choice = await player.ask(
            [
                'Heard of you? you are famous in Runescape!',
                'I have heard a little, but I think Katrine is tougher',
                'I have heard rumours that you kill people',
                'No I have never really heard of you'
            ],
            false
        );

        switch (choice) {
            case 0: // famous
                await heardOfYou(player, npc);
                break;
            case 1: // katrine tougher
                await katrineTougher(player, npc);
                break;
            case 2: // kill people
                await player.say('I have heard rumours that you kill people');

                await npc.say(
                    'Theres always someone ready to spread rumours',
                    'I heard a rumour the other day, that some men are ' +
                        'wearing skirts',
                    "If one of my men wore a skirt, he would wish he hadn't"
                );

                await promptDiscussion(player, npc);
                break;
            // no
            case 3: {
                await player.say('No I have never really heard of you');

                await npc.say(
                    'You must be new to this land then',
                    'EVERYONE knows of Lady Keli and her prowess with the sword'
                );

                const choice = await player.ask(
                    [
                        "No, still doesn't ring a bell",
                        'Yes, of course I have heard of you',
                        'You must have trained a lot for this work',
                        'I should not disturb someone as tough as you'
                    ],
                    false
                );

                switch (choice) {
                    // no
                    case 0: {
                        await player.say("No, still doesn't ring a bell");

                        await npc.say(
                            'Well, you know of me now',
                            'I will ring your bell if you do not show respect'
                        );

                        const choice = await player.ask(
                            [
                                'I do not show respect to killers and hoodlums',
                                'You must have trained a lot for this work',
                                'I should not disturb someone as tough as ' +
                                    'you, great lady'
                            ],
                            false
                        );

                        switch (choice) {
                            case 0: // killers and hoodlums
                                await player.say(
                                    'I do not show respect to killers and ' +
                                        'hoodlums'
                                );

                                await npc.say(
                                    'You should, you really should',
                                    'I am wealthy enough to place a bounty ' +
                                        'on your head',
                                    'Or just remove your head myself',
                                    'Now go, I am busy, too busy to fight a ' +
                                        'would-be hoodlum'
                                );
                                break;
                            case 1: // trained a lot
                                await trainedALot(player, npc);
                                break;
                            case 2: // do not disturb
                                await doNotDisturb(player, npc);
                                break;
                        }
                        break;
                    }
                    case 1: // yes of course
                        await heardOfYou(player, npc);
                        break;
                    case 2: // trained a lot
                        await trainedALot(player, npc);
                        break;
                    case 3: // do not disturb
                        await doNotDisturb(player, npc);
                        break;
                }
                break;
            }
        }
    } else {
        await npc.say(
            'You tricked me, and tied me up',
            'You should not stay here if you want to remain alive',
            'Guards! Guards! Kill this stranger'
        );
    }

    player.disengage();
    return true;
}

async function onUseWithNPC(player, npc, item) {
    const { world } = player;

    if (npc.id !== LADY_KELI_ID || item.id !== ROPE_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    if (!questStage) {
        player.message('I have no reason to do this');
        return true;
    }

    if (questStage === 4 || questStage === -1) {
        player.message(
            'You have rescued the prince already, you cannot use the same ' +
                'plan again'
        );

        return true;
    }

    const joeDrunk = player.cache.joeDrunk;

    if (questStage < 3 || !joeDrunk) {
        player.message(
            'You cannot tie Keli up until you have all equipment and ' +
                'disabled the guard'
        );

        return await onTalkToNPC(player, npc);
    }

    const respawnTime = npc.respawn;

    delete npc.respawn;
    world.removeEntity('npcs', npc);

    world.keliRespawnTimer = world.setTimeout(() => {
        delete world.keliRespawnTimer;
        world.addEntity('npcs', npc);
    }, respawnTime);

    player.message('You overpower Keli, tie her up, and put her in a cupboard');

    if (player.cache.keliTiedOnce) {
        // also found this text in my video and rscemulation's source
        player.message('I must rescue the prince before she escapes again!');
    } else {
        player.cache.keliTiedOnce = true;
    }

    return true;
}

module.exports = { onTalkToNPC, onUseWithNPC };
