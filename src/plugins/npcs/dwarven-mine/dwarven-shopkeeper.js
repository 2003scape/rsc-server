const { canIHelpYou } = require('../general-shopkeeper');

const DWARVEN_SHOPKEEPER_ID = 143;

async function onTalkToNPC(player, npc) {
    if (npc.id !== DWARVEN_SHOPKEEPER_ID) {
        return false;
    }

    return await canIHelpYou(player, npc, 'dwarven-mine-general');
}

module.exports = { onTalkToNPC };
