const BANANA_CRATE_ID = 182;
const RUM_ID = 318;

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== BANANA_CRATE_ID || item.id !== RUM_ID) {
        return false;
    }

    const questStage = player.questStages.piratesTreasure;
    const stashedRum = player.cache.stashedRum;

    if (questStage === 1 && !stashedRum) {
        player.inventory.remove(RUM_ID);
        player.message('@que@You stash the rum in the crate');
        player.cache.stashedRum = true;
    } else {
        player.message('@que@I have no reason to do that');
    }

    return true;
}

module.exports = { onUseWithGameObject };
