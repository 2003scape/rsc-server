// https://classic.runescape.wiki/w/Banana_tree

const GameObject = require('../../model/game-object');

const BANANA_TREE_ID = 183;
const EMPTY_BANANA_TREE_ID = 184;

const BANANA_ID = 249;

const TREE_RESPAWN_TICKS = 750; // 750 * 640ms = 8 minutes

async function onGameObjectCommandTwo(player, gameObject) {
    const { world } = player;

    if (gameObject.id === BANANA_TREE_ID) {
        let bananasLeft = Number.isNaN(+gameObject.bananasLeft)
            ? 5
            : gameObject.bananasLeft;

        bananasLeft -= 1;
        gameObject.bananasLeft = bananasLeft;

        if (bananasLeft === 0) {
            const { x, y, direction } = gameObject;

            player.message('you pick the last banana');

            world.removeEntity('gameObjects', gameObject);

            const emptyBananaTree = new GameObject(world, {
                id: EMPTY_BANANA_TREE_ID,
                x,
                y,
                direction
            });

            world.addEntity('gameObjects', emptyBananaTree);

            world.setTickTimeout(() => {
                world.removeEntity('gameObjects', emptyBananaTree);

                const bananaTree = new GameObject(world, {
                    id: BANANA_TREE_ID,
                    x,
                    y,
                    direction
                });

                world.addEntity('gameObjects', bananaTree);
            }, TREE_RESPAWN_TICKS);
        } else {
            player.message('you pick a banana');
        }

        player.inventory.add(BANANA_ID);

        return true;
    } else if (gameObject.id === EMPTY_BANANA_TREE_ID) {
        player.message('there are no bananas left on the tree');
        return true;
    }

    return false;
}

module.exports = { onGameObjectCommandTwo };
