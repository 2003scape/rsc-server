// https://classic.runescape.wiki/w/Transcript:Dommik
// identical to rommik

const { buyEquipment } = require('../rimmington/rommik');

const DOMMIK_ID = 173;

async function onTalkToNPC(player, npc) {
    if (npc.id !== DOMMIK_ID) {
        return false;
    }

    return await buyEquipment(player, npc, 'rommiks-crafting');
}

module.exports = { onTalkToNPC };
