// https://classic.runescape.wiki/w/Transcript:Rommik
// identical to dommik

const ROMMIK_ID = 156;

async function buyEquipment(player, npc, shop) {
    player.engage(npc);

    await npc.say('Would you like to buy some crafting equipment');

    const choice = await player.ask(
        [
            "No I've got all the crafting equipment I need",
            "Let's see what you've got then"
        ],
        true
    );

    switch (choice) {
        case 0:
            await npc.say('Ok fair well on your travels');
            break;
        case 1:
            player.disengage();
            player.openShop(shop);
            return true;
    }

    player.disengage();
    return true;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== ROMMIK_ID) {
        return false;
    }

    return await buyEquipment(player, npc, 'rommiks-crafty-supplies');
}

module.exports = { onTalkToNPC };
