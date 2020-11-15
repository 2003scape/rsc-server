// https://classic.runescape.wiki/w/Shopkeeper_(Rimmington)

const { canIHelpYou } = require('../general-shopkeeper');

const SHOPKEEPER_IDS = new Set([145, 146]);

async function onTalkToNPC(player, npc) {
    if (!SHOPKEEPER_IDS.has(npc.id)) {
        return false;
    }

    return await canIHelpYou(player, npc, 'rimmington-general');
}

module.exports = { onTalkToNPC };
