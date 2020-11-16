// https://classic.runescape.wiki/w/Transcript:Wydin
// > There are numerous discrepancies between what the dialogue choice is and
// > what your player says with this NPC.

const APRON_ID = 182;
const DOORFRAME_ID = 11;
const DOOR_ID = 47;
const WYDIN_ID = 129;

async function onTalkToNPC(player, npc) {
    if (npc.id !== WYDIN_ID) {
        return false;
    }

    const wydinJobStage = player.cache.wydinJobStage;

    player.engage(npc);

    if (!wydinJobStage || wydinJobStage === 1) {
        await npc.say(
            'Welcome to my foodstore',
            'Would you like to buy anything'
        );

        const choice = await player.ask(
            ['Yes please', 'No thankyou', 'what can you recommend?'],
            false
        );

        switch (choice) {
            case 0: // yes
                await player.say('Yes please');
                player.disengage();
                player.openShop('wydins-food');
                return true;
            case 2: // recommend
                await player.say('What can you recommend?');

                await npc.say(
                    'We have this really exotic fruit',
                    'All the way from karamja',
                    "It's called a banana"
                );
                break;
        }
    } else if (
        wydinJobStage === 2 ||
        player.questStages.piratesTreasure === -1
    ) {
        await npc.say('Is it nice and tidy round the back now');

        const choice = await player.ask(
            [
                'Yes, can I work out front now?',
                'Yes, are you going to pay me yet?',
                "No it's a complete mess",
                'Can I buy something please?'
            ],
            false
        );

        switch (choice) {
            case 0: // work out front
                await player.say('Yes, can I work out front now?');
                await npc.say("No I'm the one who works here");
                break;
            case 1: // pay me
                await player.say('Yes, are you going to pay me yet?');
                await npc.say('Umm no not yet');
                break;
            case 2: // mess
                await player.say("No it's a complete mess");

                await npc.say(
                    "Ah well, It'll give you something to do won't it"
                );
                break;
            case 3: // buy
                await player.say('Can I buy something please');
                await npc.say('Yes Ok');
                player.disengage();
                player.openShop('wydins-food');
                return true;
        }
    }

    player.disengage();
    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const wydinJobStage = player.cache.wydinJobStage;

    // entering the door from the grocery
    if (player.x < wallObject.x) {
        const { world } = player;

        if (!wydinJobStage) {
            const npc = world.npcs.getByID(WYDIN_ID);

            if (npc && !npc.interlocutor) {
                player.engage(npc);

                await npc.say(
                    "Heh you can't go in there",
                    'Only employees of the grocery store can go in'
                );

                const choice = await player.ask(
                    ['Well can I get a job here?', "Sorry I didn't realise"],
                    false
                );

                switch (choice) {
                    case 0: // get a job
                        await player.say('Can I get a job here?');
                        await npc.say(
                            "Well you're keen I'll give you that",
                            "Ok I'll give you a go",
                            'Have you got your own apron?'
                        );

                        if (player.inventory.has(APRON_ID)) {
                            await player.say('Yes I have');

                            await npc.say(
                                "Wow you are prepared, you're hired",
                                'Go through to the back and tidy up for me ' +
                                    'please'
                            );

                            player.cache.wydinJobStage = 1;
                        } else {
                            await player.say('No');

                            await npc.say(
                                "Well you can't work here unless you have an " +
                                    'apron',
                                'Health and safety regulations, you understand'
                            );
                        }
                        break;
                    case 1: // didn't realise
                        await player.say("Sorry I didn't realise");
                        break;
                }

                player.disengage();
            }
        } else if (player.inventory.isEquipped(APRON_ID)) {
            player.cache.wydinJobStage = 2;
            await player.enterDoor(wallObject, DOORFRAME_ID);
        } else {
            const npc = world.npcs.getByID(WYDIN_ID);

            if (npc && !npc.interlocutor) {
                player.engage(npc);

                await npc.say(
                    'Can you put your apron on before going in there please'
                );

                player.disengage();
            }
        }
    } else {
        await player.enterDoor(wallObject, DOORFRAME_ID);
    }

    return true;
}

module.exports = { onTalkToNPC, onWallObjectCommandOne };
