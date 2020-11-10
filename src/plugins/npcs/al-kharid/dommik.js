// https://classic.runescape.wiki/w/Transcript:Dommik

const DOMMIK_ID = 173;

async function onTalkToNPC(player, npc) {
    if (npc.id !== DOMMIK_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Would you like to buy some crafting equipment');

    const choice = await player.ask([
        "No I've got all the crafting equipment I need",
        "Let's see what you've got then"
    ], true);

    switch (choice) {
        case 0:
            await npc.say('Ok fair well on your travels');
            break;
        case 1:
            player.disengage();
            player.openShop('dommiks-crafting');
            return true;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
