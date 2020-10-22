const PEKSA_ID = 75;

async function onTalkToNPC(player, npc) {
    if (npc.id !== PEKSA_ID) {
        return false;
    }

    player.engage(npc);
    await npc.say('Are you interested in buying or selling a helmet?');

    const choice = await player.ask(
        ['I could be, yes', "No, I'll pass on that"],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('Well look at all these great helmets!');
            player.openShop('peksas-helmets');
            break;
        case 1:
            await npc.say('Well come back if you change your mind');
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
