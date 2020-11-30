// https://classic.runescape.wiki/w/Transcript:Klarense

const KLARENSE_ID = 193;

async function isntSeaworthy(npc) {
    await npc.say(
        "You're interested in a trip on the Lumbridge Lady are you?",
        "I admit she looks fine, but she isn't seaworthy right now"
    );
}

async function inefficientBuilders(npc) {
    await npc.say(
        'No not really',
        "Port Sarim's shipbuilders aren't very efficient",
        'So it could be quite a while'
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== KLARENSE_ID) {
        return false;
    }

    const questStage = player.questStages.dragonSlayer;
    const ownsShip = player.cache.ownsLumbridgeLady;

    player.engage(npc);

    if (!questStage || questStage === 1) {
        await isntSeaworthy(npc);

        const choice = await player.ask(
            ['Do you know when she will be seaworthy', 'Ah well, nevermind'],
            true
        );

        if (choice === 0) {
            await inefficientBuilders(npc);
        }
    } else if (questStage === 2 && !ownsShip) {
        await isntSeaworthy(npc);

        const choice = await player.ask(
            [
                'Do you know when she will be seaworthy',
                "Would you take me to Crandor Isle when it's ready?",
                "I don't suppose I could buy it",
                'Ah well, nevermind'
            ],
            true
        );

        switch (choice) {
            case 0: // seaworthy
                await inefficientBuilders(npc);
                break;
            case 1: // sail to crandor
                await npc.say(
                    'Well even if I knew how to get there',
                    "I wouldn't like to risk it",
                    'Especially after to goin to all the effort of fixing ' +
                        'the old girl up'
                );
                break;
            // buy it
            case 2: {
                await npc.say(
                    'I guess you could',
                    "I'm sure the work needed to do on it wouldn't be too " +
                        'expensive',
                    'How does 2000 gold sound for a price?'
                );

                const choice = await player.ask(
                    [
                        'Yep sounds good',
                        "I'm not paying that much for a broken boat"
                    ],
                    true
                );

                switch (choice) {
                    case 0: // yes
                        if (player.inventory.has(10, 2000)) {
                            player.inventory.remove(10, 2000);
                            await npc.say("Ok she's all yours");
                            player.cache.ownsLumbridgeLady = true;
                        } else {
                            await player.say(
                                "Except I don't have that much money on me"
                            );
                        }
                        break;
                    case 1: // no
                        await npc.say(
                            "That's Ok, I didn't particularly want to sell " +
                                'anyway'
                        );
                        break;
                }
                break;
            }
        }
    } else {
        const choice = await player.ask(
            [
                'So would you like to sail this ship to Crandor Isle for me?',
                'So what needs fixing on this ship?',
                "What are you going to do now you don't have a ship?"
            ],
            true
        );

        switch (choice) {
            case 0: // sail to crandor
                await npc.say("No not me, I'm frightened of dragons");
                break;
            case 1: // fixing
                await npc.say(
                    'Well the big gaping hole in the hold is the main problem',
                    "you'll need a few planks",
                    'Hammered in with steel nails'
                );
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
