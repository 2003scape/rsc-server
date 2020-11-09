// https://classic.runescape.wiki/w/Transcript:Border_Guard

const GameObject = require('../../../model/game-object');

const CLOSED_GATE_ID = 180;
const OPEN_GATE_ID = 181;

// the guard outside of al-kharid (from lumbridge to al-kharid)
const BORDER_GUARD_ENTRY = 161;

// the guard inside of al-kharid (to lumbridge from al-kharid)
const BORDER_GUARD_EXIT = 162;

// replace the gate and move the player through it (it's still a blocked object,
// so people can't steal your toll)
async function handleGate(player, entry) {
    const { world } = player;

    const gameObject = world.gameObjects.getByID(CLOSED_GATE_ID);
    const { x, y, direction } = gameObject;

    if (entry) {
        await player.walkToPosition(92, 649);
    } else {
        await player.walkToPosition(91, 649);
    }

    world.removeEntity('gameObjects', gameObject);

    const openGate = new GameObject(world, {
        id: OPEN_GATE_ID,
        x,
        y,
        direction
    });

    world.addEntity('gameObjects', openGate);

    if (entry) {
        player.walkTo(-1, 0);
    } else {
        player.walkTo(1, 0);
    }

    player.message('The gate swings open');
    player.sendSound('opendoor'); // TODO check this

    await world.sleepTicks(1);

    world.removeEntity('gameObjects', openGate);

    const closedGate = new GameObject(world, {
        id: CLOSED_GATE_ID,
        x,
        y,
        direction
    });

    world.addEntity('gameObjects', closedGate);
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== BORDER_GUARD_ENTRY && npc.id !== BORDER_GUARD_EXIT) {
        return false;
    }

    player.engage(npc);

    // entering or exiting al-kharid?
    const entry = npc.id === BORDER_GUARD_ENTRY;

    await player.say('Can I come through this gate?');

    if (player.questStages.princeAliRescue !== -1) {
        await npc.say('You must pay a toll of 10 gold coins to pass');

        const choice = await player.ask(
            [
                "No thankyou, I'll walk round",
                'Who does my money go to?',
                'yes ok'
            ],
            false
        );

        switch (choice) {
            case 0: // no thanks
                await player.say("No thankyou, I'll walk round");
                await npc.say('Ok suit yourself');
                break;
            case 1: // money
                await player.say('Who does my money go to?');
                await npc.say('The money goes to the city of Al Kharid');
                break;
            case 2: // ok
                await player.say('Yes ok');

                if (player.inventory.has(10, 10)) {
                    player.inventory.remove(10, 10);
                    player.message('You pay the guard');
                    await npc.say('You may pass');
                    await handleGate(player, entry);
                } else {
                    await player.say(
                        "Oh dear I don't actually seem to have enough money"
                    );
                }
                break;
        }
    } else {
        await npc.say('You may pass for free, you are a friend of Al Kharid');
        await handleGate(player, entry);
    }

    player.disengage();

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== CLOSED_GATE_ID) {
        return false;
    }

    player.message('You need to talk to the border guard');

    return true;
}

module.exports = { onTalkToNPC, onGameObjectCommandOne };
