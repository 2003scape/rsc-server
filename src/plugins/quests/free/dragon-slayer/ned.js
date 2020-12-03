// https://classic.runescape.wiki/w/Transcript:Ned

const regions = require('@2003scape/rsc-data/regions');

const MAP_ID = 415;
const MAP_PIECE_IDS = [416, 417, 418];
const NED_SHIP_ID = 194;

const VOYAGE_MESSAGES = [
    'You feel the ship begin to move',
    'You are out at sea',
    'The ship is sailing',
    'The ship is sailing',
    'You feel a crunch'
];

// this is for the Ned in draynor
async function takeMeToCrandor(player, npc) {
    const { world } = player;

    await npc.say(
        'Well I was a sailor',
        "I've not been able to get work at sea these days though",
        'They say I am too old'
    );

    player.message("@que@There is a wistfull look in Ned's eyes");
    await world.sleepTicks(3);

    await npc.say(
        'I miss those days',
        'If you could get me a ship I would take you anywhere'
    );

    if (player.cache.lumbridgeLadyFixStage === -1) {
        await player.say('As it happens I do have a ship ready to sail');
        await npc.say("That'd be grand, where is it");

        await player.say(
            "It's called the Lumbrige Lady and it's docked in Port Sarim"
        );

        await npc.say(
            "I'll go right over there and check her out then",
            'See you over there'
        );

        player.cache.lumbirdgeLadyCrandor = false;
        player.cache.nedInShip = true;
    } else {
        await player.say('I will work on finding a sea worthy ship then');
    }
}

async function travelToCrandor(player, npc) {
    const { world } = player;
    const { spawnX, spawnY } = regions['lumbridge-lady-broken-ned'];

    for (const message of VOYAGE_MESSAGES) {
        player.message(`@que@${message}`);
        await world.sleepTicks(3);
    }

    await npc.say("Aha we've arrived");

    player.teleport(spawnX, spawnY);

    delete player.cache.lumbridgeLadyFixStage;
    player.cache.lumbirdgeLadyCrandor = true;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== NED_SHIP_ID) {
        return false;
    }

    const questStage = player.questStages.dragonSlayer;
    const shipInCrandor = player.cache.lumbirdgeLadyCrandor;
    const shipFixStage = player.cache.lumbridgeLadyFixStage;

    player.engage(npc);

    if (shipInCrandor) {
        const choice = await player.ask(
            [
                'Is the ship ready to sail back?',
                'So are you enjoying this exotic island vacation?'
            ],
            true
        );

        switch (choice) {
            case 0: // ready to sail back
                await npc.say(
                    'Well when we arrived the ship took a nasty jar from ' +
                        'those rocks',
                    'We may be stranded'
                );
                break;
            case 1: // vacation
                await npc.say(
                    "Well it would have been better if I'd brought my sun " +
                        'lotion',
                    "Oh and the skeletons which won't let me leave the ship",
                    "Probably aren't helping either"
                );
                break;
        }
    } else {
        await npc.say('Hello again lad');

        if (questStage === 2) {
            const choice = await player.ask(
                [
                    'So are you going to take me to Crandor Island now then?',
                    'So are you still up to sailing this ship?'
                ],
                true
            );

            switch (choice) {
                case 0: {
                    await npc.say(
                        "Okay show me the map and we'll set sail now"
                    );

                    let hasMap = false;

                    if (player.inventory.has(MAP_ID)) {
                        hasMap = true;
                        player.inventory.remove(MAP_ID);
                        player.message('@que@You give the map to ned');
                    } else {
                        hasMap = true;

                        for (const itemID of MAP_PIECE_IDS) {
                            if (!player.inventory.has(itemID)) {
                                hasMap = false;
                                break;
                            }
                        }

                        if (hasMap) {
                            for (const itemID of MAP_PIECE_IDS) {
                                player.inventory.remove(itemID);
                            }

                            player.message(
                                '@que@You give the parts of the map to ned'
                            );
                        }
                    }

                    if (hasMap) {
                        await player.say('Here it is');
                        player.questStages.dragonSlayer = 3;
                        await travelToCrandor(player, npc);
                    }
                    break;
                }
                case 1:
                    await npc.say(
                        'Well I am a tad rusty',
                        "I'm sure it'll all come back to me, once I get into " +
                            'action',
                        'I hope...'
                    );
                    break;
            }
        } else {
            const choice = await player.ask(
                [
                    'Can you take me back to Crandor again',
                    'How did you get back?'
                ],
                true
            );

            switch (choice) {
                case 0: // back to crandor
                    if (shipFixStage === -1) {
                        await npc.say('Okie Dokie');
                        await travelToCrandor(player, npc);
                    } else {
                        await npc.say(
                            'Well I would, but the last adventure',
                            "Hasn't left this tub in the best of shapes",
                            "You'll have to fix it again"
                        );
                    }
                    break;
                case 1: // how did you get back
                    await npc.say(
                        'I got towed back by a passing friendly whale'
                    );
                    break;
            }
        }
    }

    player.disengage();
    return true;
}

module.exports = { takeMeToCrandor, onTalkToNPC };
