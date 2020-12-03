// https://classic.runescape.wiki/w/Transcript:Professor_Oddenstein

const CHICKEN_ID = 91;
const ERNEST_ID = 92;
const ODDENSTEIN_ID = 38;
const OIL_CAN_ID = 208;
const PRESSURE_GAUGE_ID = 175;
const RUBBER_TUBE_ID = 213;

async function changeHimBack(player, npc) {
    await npc.say(
        "Um it's not so easy",
        'My machine is broken',
        'And the house gremlins',
        'Have run off with some vital bits'
    );

    await player.say('Well I can look out for them');

    await npc.say(
        'That would be a help',
        "They'll be somewhere in the manor house or its grounds",
        'The gremlins never go further than the entrance gate',
        "I'm missing the pressure gauge and a rubber tube",
        "They've also taken my oil can",
        "Which I'm going to need to get this thing started again"
    );

    player.questStages.ernestTheChicken = 2;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== ODDENSTEIN_ID) {
        return false;
    }

    const questStage = player.questStages.ernestTheChicken;

    player.engage(npc);

    if (!questStage || questStage === 1 || questStage === -1) {
        await npc.say(
            'Be careful in here',
            'Lots of dangerous equipment in here'
        );

        const choices = ['What do this machine do?', 'Is this your house?'];

        if (questStage === 1) {
            choices.unshift("I'm looking for a guy called Ernest");
        }

        let choice = await player.ask(choices, true);

        if (questStage !== 1) {
            choice += 1;
        }

        switch (choice) {
            // looking for ernest
            case 0: {
                await npc.say(
                    'Ah Ernest, top notch bloke',
                    "He's helping me with my experiments"
                );

                await player.say('So you know where he is then?');
                await npc.say("He's that chicken over there");
                await player.say('Ernest is a chicken?', 'Are you sure?');

                await npc.say(
                    "Oh he isn't normally a chicken",
                    "Or at least he wasn't",
                    'Until he helped me test my pouletmorph machine',
                    'It was originally going to be called a transmutation ' +
                        'machine',
                    'But after testing Pouletmorph seems more appropriate'
                );

                const choice = await player.ask(
                    [
                        "I'm glad Veronica didn't actually get engaged to a " +
                            'chicken',
                        'Change him back this instant'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // didnt engage chicken
                        await npc.say("Who's Veronica?");

                        await player.say(
                            "Ernest's fiancee",
                            "She probably doesn't want to marry a chicken"
                        );

                        await npc.say(
                            'Ooh I dunno',
                            'She could have free eggs for breakfast'
                        );

                        await player.say(
                            "I think you'd better change him back"
                        );

                        await changeHimBack(player, npc);
                        break;
                    case 1: // change him back
                        await changeHimBack(player, npc);
                        break;
                }

                break;
            }
            case 1: // what does the machine do
                await npc.say(
                    'Nothing at the moment',
                    "As it's broken",
                    "It's meant to be a transmutation machine",
                    'It has also spent time as a time travel machine',
                    'And a dramatic lightning generator',
                    'And a thing for generating monsters'
                );
                break;
            case 2: // is this your house
                await npc.say(
                    "No, I'm just one of the tenants",
                    'It belongs to the count',
                    'Who lives in the basement'
                );
                break;
        }
    } else if (questStage === 2) {
        await npc.say('Have you found anything yet?');

        let foundItems = 0;
        let hasOil = false;
        let hasPressureGauge = false;
        let hasRubberTube = false;

        if (player.inventory.has(OIL_CAN_ID)) {
            foundItems += 1;
            hasOil = true;
        }

        if (player.inventory.has(PRESSURE_GAUGE_ID)) {
            foundItems += 1;
            hasPressureGauge = true;
        }

        if (player.inventory.has(RUBBER_TUBE_ID)) {
            foundItems += 1;
            hasRubberTube = true;
        }

        if (foundItems === 3) {
            const { world } = player;

            await player.say('I have everything');
            await npc.say('Give em here then');

            player.inventory.remove(RUBBER_TUBE_ID);
            player.inventory.remove(PRESSURE_GAUGE_ID);
            player.inventory.remove(OIL_CAN_ID);

            player.message(
                '@que@You give a rubber tube, a pressure gauge and a can of ' +
                    'oil to the Professer'
            );

            await world.sleepTicks(3);

            player.message('@que@Oddenstein starts up the machine');
            await world.sleepTicks(3);

            player.message('@que@The machine hums and shakes');
            await world.sleepTicks(3);

            player.message(
                '@que@Suddenly a ray shoots out of the machine and at the ' +
                    'chicken'
            );

            await world.sleepTicks(3);

            const chicken = world.npcs.getByID(CHICKEN_ID);

            let ernest;

            if (chicken) {
                // first check if the chicken is here and replace it
                ernest = world.replaceEntity('npcs', chicken, ERNEST_ID);

                world.ernestTimeout = world.setTimeout(() => {
                    world.replaceEntity('npcs', ernest, CHICKEN_ID);
                }, 60000);
            } else {
                // use the existing ernest and reset his timeout
                world.clearTimeout(world.ernestTimeout);

                world.ernestTimeout = world.setTimeout(() => {
                    world.replaceEntity('npcs', ernest, CHICKEN_ID);
                }, 60000);

                ernest = world.npcs.getByID(ERNEST_ID);
            }

            player.engage(ernest);

            await ernest.say(
                'Thank you sir',
                'It was dreadfully irritating being a chicken',
                'How can I ever thank you?'
            );

            await player.say('Well a cash reward is always nice');
            await ernest.say('Of course, of course');
            player.inventory.add(10, 300);
            player.message('@que@Ernest hands you 300 coins');
            await world.sleepTicks(3);

            // unlock professor oddenstein since we engaged with ernest
            npc.interlocutor = null;
            npc.unlock();

            player.message(
                'Well done. You have completed the Ernest the chicken quest'
            );

            delete player.cache.oilCanLevers;
            delete player.cache.killedPiranhas;

            player.questStages.ernestTheChicken = -1;
            player.addQuestPoints(4);
            player.message('@gre@You haved gained 4 quest points!');
        } else if (foundItems === 0) {
            await player.say("I'm afraid I don't have any yet!");

            await npc.say(
                'I need a rubber tube, a pressure gauge and a can of oil',
                'Then your friend can stop being a chicken'
            );
        } else {
            await player.say('I have found some of the things you need:');

            if (hasOil) {
                await player.say('I have a can of oil');
            }

            if (hasPressureGauge) {
                await player.say('I have a pressure gauge');
            }

            if (hasRubberTube) {
                await player.say('I have a rubber tube');
            }

            await npc.say("Well that's a start", 'You still need to find');

            if (!hasOil) {
                await npc.say('A can of oil');
            }

            if (!hasPressureGauge) {
                await npc.say('A Pressure Gauge');
            }

            if (!hasRubberTube) {
                await npc.say('A rubber tube');
            }

            await player.say("OK I'll try and find them");
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
