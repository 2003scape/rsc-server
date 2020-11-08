// https://classic.runescape.wiki/w/Sheep

const SHEARS_ID = 144;
const SHEEP_ID = 2;
const WOOL_ID = 145;

async function onUseWithNPC(player, npc, item) {
    if (npc.id !== SHEEP_ID || item.id !== SHEARS_ID) {
        return false;
    }

    const { world } = player;

    player.lock();
    npc.lock();
    player.faceEntity(npc);
    npc.faceEntity(player);

    player.sendBubble(SHEARS_ID);
    player.message('You attempt to shear the sheep');

    await world.sleepTicks(3);

    if (Math.floor(Math.random() * 4) !== 0) {
        player.message('You get some wool');
        player.inventory.add(WOOL_ID);
    } else {
        player.message('The sheep manages to get away from you!');
    }

    player.unlock();
    npc.unlock();

    return true;
}

module.exports = { onUseWithNPC };
