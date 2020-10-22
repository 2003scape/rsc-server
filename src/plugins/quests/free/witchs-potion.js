const GroundItem = require('../../../model/ground-item');

// the rats that can drop a tail
const RAT_IDS = [19, 29, 47, 177, 367, 473];
const RAT_TAIL_ID = 271;

async function onKilledNPC(player, npc) {
    if (player.questStages.witchsPotion === -1 || RAT_IDS.indexOf(npc.id) < 0) {
        return false;
    }

    const { world } = player;

    world.dropItem(
        new GroundItem({ id: RAT_TAIL_ID, x: player.x, y: player.y }),
        player
    );

    // still return false so default gets called and they still drop bones
    return false;
}

module.exports = { onKilledNPC };
