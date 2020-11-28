// https://classic.runescape.wiki/w/Transcript:Weaponsmaster

const PHOENIX_CROSSBOW_ID = 59;
const WEAPONSMASTER_ID = 37;

async function onTalkToNPC(player, npc) {
    if (npc.id !== WEAPONSMASTER_ID) {
        return false;
    }

    const phoenixStage = player.cache.phoenixStage || 0;

    player.engage(npc);

    if (phoenixStage === -1) {
        await npc.say('Hello Fellow phoenix', 'What are you after?');

        const choice = await player.ask(
            ["I'm after a weapon or two", "I'm looking for treasure"],
            true
        );

        switch (choice) {
            case 0: // weapon or two
                await npc.say('Sure have a look around');
                break;
            case 1: // treasure
                await npc.say(
                    "We've not got any up here",
                    'Go mug someone somewhere',
                    'If you want some treasure'
                );
                break;
        }
    } else {
        await npc.say("Hey I don't know you");
        player.disengage();
        player.lock();
        await npc.attack(player);
        return true;
    }

    player.disengage();
    return true;
}

async function onGroundItemTake(player, groundItem) {
    if (groundItem.id !== PHOENIX_CROSSBOW_ID) {
        return false;
    }

    const { world } = player;
    const phoenixStage = player.cache.phoenixStage || 0;
    const weaponsmaster = world.npcs.getByID(WEAPONSMASTER_ID);

    if (
        weaponsmaster &&
        !weaponsmaster.locked &&
        player.localEntities.known.npcs.has(weaponsmaster)
    ) {
        player.engage(weaponsmaster);

        if (phoenixStage === -1) {
            await weaponsmaster.say(
                "Hey, that's Straven's",
                "He won't like you messing with that"
            );

            player.disengage();
        } else {
            await weaponsmaster.say('Hey thief!');
            player.disengage();
            player.lock();
            await weaponsmaster.attack(player);
        }

        return true;
    }

    return false;
}

async function onNPCAttack(player, npc) {
    if (npc.id !== WEAPONSMASTER_ID || player.cache.phoenixStage !== -1) {
        return false;
    }

    await player.say("Nope, I'm not going to attack a fellow gang member");

    return true;
}

module.exports = { onTalkToNPC, onGroundItemTake, onNPCAttack };
