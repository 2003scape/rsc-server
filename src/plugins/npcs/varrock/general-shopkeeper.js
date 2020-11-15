// https://classic.runescape.wiki/w/Shopkeeper_(Varrock)

const { canIHelpYou } = require('../general-shopkeeper');

const SHOPKEEPER_IDS = new Set([51, 82]);

async function onTalkToNPC(player, npc) {
    if (!SHOPKEEPER_IDS.has(npc.id)) {
        return false;
    }

    return await canIHelpYou(player, npc, 'varrock-general');
}

module.exports = { onTalkToNPC };
