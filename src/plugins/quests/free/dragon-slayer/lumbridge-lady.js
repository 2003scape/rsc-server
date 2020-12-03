// https://classic.runescape.wiki/w/Lumbridge_Lady

const { onTalkToNPC } = require('./klarense');
const regions = require('@2003scape/rsc-data/regions');

const CRANDOR_SHIP_IDS = new Set([233, 234]);
const HAMMER_ID = 168;
const HOLE_IDS = new Set([226, 232]);
const LADDER_ID = 227;
const PLANK_ID = 410;
const PORT_SARIM_SHIP_IDS = new Set([224, 225]);
const STEEL_NAILS_ID = 419;
const KLARENSE_ID = 193;

async function enterShip(player) {
    if (player.cache.lumbridgeLadyFixStage === -1) {
        if (player.cache.nedInShip) {
            const { spawnX, spawnY } = regions['lumbridge-lady-fixed-ned'];
            player.teleport(spawnX, spawnY);
        } else {
            const { spawnX, spawnY } = regions['lumbridge-lady-fixed'];
            player.teleport(spawnX, spawnY);
        }
    } else {
        if (player.cache.nedInShip) {
            const { spawnX, spawnY } = regions['lumbridge-lady-broken-ned'];
            player.teleport(spawnX, spawnY);
        } else {
            const { spawnX, spawnY } = regions['lumbridge-lady-broken'];
            player.teleport(spawnX, spawnY);
        }
    }
}

async function exitShip(player) {
    if (player.cache.lumbirdgeLadyCrandor) {
        // https://youtu.be/KPJYewzuHI8?t=2206
        player.teleport(409, 640);
    } else {
        player.teleport(259, 641);
    }

    player.message('You leave the ship');
}

async function onGameObjectCommandOne(player, gameObject) {
    if (CRANDOR_SHIP_IDS.has(gameObject.id)) {
        player.cache.lumbirdgeLadyCrandor = true;
        await enterShip(player);
        return true;
    } else if (PORT_SARIM_SHIP_IDS.has(gameObject.id)) {
        if (player.cache.ownsLumbridgeLady) {
            player.cache.lumbirdgeLadyCrandor = false;
            await enterShip(player);
        } else {
            const { world } = player;
            const klarense = world.npcs.getByID(KLARENSE_ID);

            if (klarense && !klarense.locked) {
                return await onTalkToNPC(player, klarense);
            } else {
                player.message('You must talk to the owner about this.');
            }
        }

        return true;
    } else if (gameObject.id === LADDER_ID) {
        await exitShip(player);
        return true;
    }

    return false;
}

async function onUseWithGameObject(player, gameObject, item) {
    if (item.id !== PLANK_ID || !HOLE_IDS.has(gameObject.id)) {
        return false;
    }

    if (player.cache.lumbirdgeLadyCrandor) {
        player.message("The ship doesn't seem easily repairable at the moment");
    } else if (player.cache.karamjaSecretPasasge) {
        player.message(
            "You don't need to mess about with broken ships",
            'Now you have found that secret passage from Karamja'
        );
    } else if (!player.inventory.has(STEEL_NAILS_ID, 4)) {
        player.message('You need 4 steel nails to attach the plank with');
    } else if (!player.inventory.has(HAMMER_ID)) {
        player.message('You need a hammer to hammer the nails in with');
    } else {
        let fixStage = player.cache.lumbridgeLadyFixStage || 0;

        player.inventory.remove(STEEL_NAILS_ID, 4);
        player.inventory.remove(PLANK_ID);
        player.message('You hammer the plank over the hole');

        fixStage += 1;

        if (fixStage === 3) {
            player.cache.lumbridgeLadyFixStage = -1;
            await enterShip(player);
            player.message('You board up the hole in the ship');
        } else {
            player.cache.lumbridgeLadyFixStage = fixStage;
            player.message(
                'You still need more planks to close the hole completely'
            );
        }
    }

    return true;
}

module.exports = { onGameObjectCommandOne, onUseWithGameObject };
