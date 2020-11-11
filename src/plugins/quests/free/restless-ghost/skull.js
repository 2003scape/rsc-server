const NPC = require('../../../../model/npc');

const SKULL_ID = 27;
const SKELETON_ID = 50;

async function onGroundItemTake(player, groundItem) {
    if (groundItem.id !== SKULL_ID) {
        return false;
    }

    const questStage = player.questStages.theRestlessGhost;
    const takenGhostSkull = player.cache.takenGhostSkull;

    if (questStage === 3) {
        const { world } = player;

        world.removeEntity('groundItems', groundItem);
        player.inventory.add(SKULL_ID);
        player.sendSound('takeobject');

        if (!takenGhostSkull) {
            player.cache.takenGhostSkull = true;

            let [skeleton] = world.npcs
                .getInArea(player.x, player.y, 16)
                .filter((npc) => npc.id === SKELETON_ID);

            if (!skeleton) {
                skeleton = new NPC(world, {
                    id: SKELETON_ID,
                    x: 218,
                    y: 3521,
                    minX: 212,
                    maxX: 222,
                    minY: 3515,
                    maxY: 3525
                });

                delete skeleton.respawn;

                world.setTickTimeout(() => {
                    skeleton.retreat();
                    world.removeEntity('npcs', skeleton);
                }, 132);

                world.addEntity('npcs', skeleton);

                player.message('Out of nowhere a skeleton appears');
            }

            await skeleton.attack(player);
        }
    } else {
        player.lock();

        await player.say(
            'That skull is scary',
            "I've got no reason to take it",
            "I think I'll leave it alone"
        );

        player.unlock();
    }

    return true;
}

module.exports = { onGroundItemTake };
