const thieving = require('@2003scape/rsc-data/skills/thieving');

const PICKPOCKET_NPC_IDS = Object.keys(thieving.pickpocket).map(Number);

async function onNPCCommand(player, npc, command) {
    if (command !== 'pickpocket' || PICKPOCKET_NPC_IDS.indexOf(npc.id) < 0) {
        return false;
    }
}

module.exports = { onNPCCommand };
