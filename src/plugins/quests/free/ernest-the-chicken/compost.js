// https://classic.runescape.wiki/w/Compost_Heap

const CLOSET_KEY_ID = 212;
const COMPOST_ID = 134;
const SPADE_ID = 211;

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== COMPOST_ID) {
        return false;
    }

    player.message("I'm not looking through that with my hands");

    return true;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== COMPOST_ID || item.id !== SPADE_ID) {
        return false;
    }

    const { world } = player;
    const questStage = player.questStages.ernestTheChicken;

    player.message('@que@You dig through the compost heap');
    await world.sleepTicks(3);

    if (questStage === -1 || player.inventory.has(CLOSET_KEY_ID)) {
        player.message('@que@You find nothing of interest');
    } else {
        player.inventory.add(CLOSET_KEY_ID);
        player.message('@que@You find a small key');
    }

    return true;
}

module.exports = { onGameObjectCommandTwo, onUseWithGameObject };
