// :: commands

const NPC = require('../model/npc');
const regions = require('@2003scape/rsc-data/regions');

async function command({ player }, { command, args }) {
    if (!player.isAdministrator()) {
        return;
    }

    switch (command) {
        case 'appearance':
            player.sendAppearance();
            break;
        case 'step':
            const deltaX = +args[0];
            const deltaY = +args[1];

            player.message(player.canWalk(deltaX, deltaY).toString());
            player.walkTo(deltaX, deltaY);
            break;
        case 'npc': {
            const npc = new NPC(player.world, {
                id: +args[0],
                x: player.x,
                y: player.y,
                minX: player.x - 4,
                maxX: player.x + 4,
                minY: player.y - 4,
                maxY: player.y + 4
            });

            player.world.addEntity('npcs', npc);
            break;
        }
        case 'face':
            player.faceDirection(+args[0], +args[1]);
            break;
        case 'item':
            player.inventory.add(+args[0], +args[1] || 1);
            break;
        case 'sound':
            player.sendSound(args[0]);
            break;
        case 'bubble':
            player.sendBubble(+args[0]);
            break;
        case 'addexp':
            player.addExperience(args[0], +args[1] * 4, 0);
            break;
        case 'clearentities':
            player.localEntities.clear();
            break;
        case 'coords':
            player.message(
                `${player.x}, ${player.y}, facing=${player.direction}`
            );
            break;
        case 'teleport':
            if (Number.isNaN(+args[0])) {
                const { spawnX, spawnY } = regions[args[0]];

                if (spawnX && spawnY) {
                    player.teleport(spawnX, spawnY, true);
                }

                break;
            }

            player.teleport(+args[0], +args[1], true);
            break;
        case 'ask':
            const choice = await player.ask(['hey?', 'sup?'], true);
            player.message('you chose ', choice);
            break;
        case 'say':
            await player.say(...args);
            break;
    }
}

module.exports = { command };
