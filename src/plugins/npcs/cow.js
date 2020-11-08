// https://classic.runescape.wiki/w/Cow

const COW_IDS = new Set([6, 217]);
const BUCKET_ID = 21;
const MILK_ID = 22;

async function onUseWithNPC(player, npc, item) {
    if (!COW_IDS.has(npc.id) || item.id !== BUCKET_ID) {
        return false;
    }

    const { world } = player;

    player.lock();
    npc.lock();
    npc.faceEntity(player);

    player.sendBubble(BUCKET_ID);
    player.inventory.remove(BUCKET_ID);
    player.inventory.add(MILK_ID);
    player.message('You milk the cow');

    await world.sleepTicks(5);

    player.unlock();
    npc.unlock();

    return true;
}

module.exports = { onUseWithNPC };
