// https://classic.runescape.wiki/w/Transcript:Border_Guard

const CLOSED_GATE_ID = 180;
const OPEN_GATE_ID = 181;

// the guard outside of al-kharid (from lumbridge to al-kharid)
const BORDER_GUARD_ENTRY = 161;

// the guard inside of al-kharid (to lumbridge from al-kharid)
const BORDER_GUARD_EXIT = 162;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BORDER_GUARD_ENTRY && npc.id !== BORDER_GUARD_EXIT) {
        return false;
    }

    const { world } = player;
    const gate = world.gameObjects.getByID(CLOSED_GATE_ID);
    const princeAliRescueStage = player.questStages.princeAliRescue;

    player.engage(npc);

    await player.say('Can I come through this gate?');

    if (princeAliRescueStage !== -1 && princeAliRescueStage !== 4) {
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
                    await player.enterGate(gate, OPEN_GATE_ID);
                } else {
                    await player.say(
                        "Oh dear I don't actually seem to have enough money"
                    );
                }
                break;
        }
    } else {
        await npc.say('You may pass for free, you are a friend of Al Kharid');
        await player.enterGate(gate, OPEN_GATE_ID);
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
