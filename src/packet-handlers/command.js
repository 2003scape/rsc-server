// :: commands

const NPC = require('../model/npc');
const items = require('@2003scape/rsc-data/config/items');
const quests = require('@2003scape/rsc-data/quests');
const regions = require('@2003scape/rsc-data/regions');

async function command({ player }, { command, args }) {
    /*if (!player.isAdministrator()) {
        return;
    }*/

    const { world } = player;

    switch (command) {
        case 'setqp':
            if (!args[0] || Number.isNaN(+args[0])) {
                player.message('invalid argument');
                break;
            }

            player.questPoints = +args[0];
            break;
        case 'kick': {
            if (!args[0]) {
                player.message('invalid player');
                break;
            }

            const playerKicked = world.getPlayerByUsername(args[0]);

            if (!playerKicked) {
                player.message('no such player: ' + args[0]);
                break;
            }

            await playerKicked.logout();
            player.message('kicked player: ' + args[0]);
            break;
        }
        case 'appearance':
            player.sendAppearance();
            break;
        case 'step': {
            const deltaX = +args[0];
            const deltaY = +args[1];

            player.message(player.canWalk(deltaX, deltaY).toString());
            player.walkTo(deltaX, deltaY);
            break;
        }
        case 'npc': {
            const npc = new NPC(world, {
                id: +args[0],
                x: player.x,
                y: player.y,
                minX: player.x - 4,
                maxX: player.x + 4,
                minY: player.y - 4,
                maxY: player.y + 4
            });

            delete npc.respawn;

            world.addEntity('npcs', npc);
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
            player.addExperience(args[0], +args[1] * 4, false);
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
        case 'ask': {
            const choice = await player.ask(
                ['hey?', 'sup?', 'more', 'test', 'again'],
                true
            );

            player.message('you chose ', choice);
            break;
        }
        case 'say':
            await player.say(...args);
            break;
        case 'dmg':
            player.damage(+args[0]);
            break;
        case 'shop':
            player.openShop(args[0]);
            break;
        case 'give': {
            const other = world.getPlayerByUsername(args[0]);

            if (other) {
                other.inventory.add(+args[1], +args[2] || 1);
                other.message(`${player.username} gave you an item`);
                player.message(`gave ${args[0]} item ${args[1]}`);
            } else {
                player.message(`unable to find player ${args[0]}`);
            }
            break;
        }
        case 'bank':
            player.bank.open();
            break;
        case 'fatigue':
            player.fatigue = 75000;
            player.sendFatigue();
            break;
        case 'chaseobj':
            await player.chase(world.gameObjects.getByID(+args[0]), false);
            break;
        case 'gotoentity': {
            const entities = world[args[0]];
            const entity = entities.getByID(+args[1]);

            if (entity) {
                player.teleport(entity.x, entity.y, true);
            }

            break;
        }
        case 'setquest': {
            let questID;

            if (Number.isNaN(+args[0])) {
                questID = quests
                    .map((name) => name.toLowerCase())
                    .indexOf(args[0].toLowerCase());
            } else {
                questID = +args[0];
            }

            if (questID > -1) {
                player.questStages[quests[questID]] = +args[1];
            }

            break;
        }
        case 'setcache':
            player.cache[args[0]] = JSON.parse(args[1]);
            break;
        case 'droprandom': {
            for (let i = 0; i < +args[0]; i += 1) {
                const randomID = Math.floor(Math.random() * 1290);
                const item = items[randomID];

                if (item.members) {
                    continue;
                }

                if (item.stackable) {
                    world.addPlayerDrop(player, {
                        id: randomID,
                        amount: Math.floor(Math.random() * 10000)
                    });
                } else {
                    world.addPlayerDrop(player, { id: randomID });
                }
            }
            break;
        }
        case 'goto': {
            const otherPlayer = world.getPlayerByUsername(args[0]);
            player.teleport(otherPlayer.x, otherPlayer.y);
            break;
        }
        case 'clearinventory': {
            player.inventory.items = [];
            player.inventory.sendAll();
            break;
        }
        case 'npcchase': {
            const npc = Array.from(player.localEntities.known.npcs).find(
                (npc) => {
                    return npc.id === +args[0];
                }
            );

            if (npc) {
                await npc.attack(player);
            }

            break;
        }
        case 'npccoords':
            player.message(world.npcs.getAtPoint(+args[0], +args[1]).length);
            break;
    }
}

module.exports = { command };
