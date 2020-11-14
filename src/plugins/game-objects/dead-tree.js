// https://classic.runescape.wiki/w/Evil_Tree

const EVIL_TREE_ID = 88;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== EVIL_TREE_ID) {
        return false;
    }

    const { world } = player;

    player.message('The tree seems to lash out at you');
    await world.sleepTicks(1);

    let damage = Math.floor(player.skills.hits.base * 0.2);

    if (player.skills.hits.current - damage <= 0) {
        damage = 0;
    }

    player.damage(damage);
    player.message('You are badly scratched by the tree');

    return true;
}

module.exports = { onGameObjectCommandOne };
