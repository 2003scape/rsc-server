const { canIHelpYou } = require('../general-shopkeeper');

const SHOPKEEPER_IDS = new Set([185, 186]);

async function onTalkToNPC(player, npc) {
    if (!SHOPKEEPER_IDS.has(npc.id)) {
        return false;
    }

    return await canIHelpYou(player, npc, 'edgeville-general');
}

module.exports = { onTalkToNPC };
