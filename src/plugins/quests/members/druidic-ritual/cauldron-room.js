const { ENCHANTED_IDS } = require('./sanfew');

const NONENCHANTED_IDS = {
    bear: 502,
    beef: 504,
    chicken: 133,
    rat: 503
};

const SUIT_OF_ARMOR_ID = 206;

const CAULDRON_OF_THUNDER_ID = 236;

const GUARDED_DOOR_ID = 63;
const OTHER_DOORS_ID = 64;

async function onUseWithGameObject(player, gameObject, item) {
    if (
        gameObject.id !== CAULDRON_OF_THUNDER_ID ||
        player.questStages.druidicRitual !== 2
    ) {
        return false;
    }

    const { world } = player;

    switch (item.id) {
        case NONENCHANTED_IDS.bear:
            player.message('You dip the bear meat in the cauldron');
            player.sendSound('fish');
            await world.sleepTicks(3);
            player.inventory.remove(NONENCHANTED_IDS.bear);
            player.inventory.add(ENCHANTED_IDS.bear);
            break;
        case NONENCHANTED_IDS.beef:
            player.message('You dip the beef in the cauldron');
            player.sendSound('fish');
            await world.sleepTicks(3);
            player.inventory.remove(NONENCHANTED_IDS.beef);
            player.inventory.add(ENCHANTED_IDS.beef);
            break;
        case NONENCHANTED_IDS.chicken:
            player.message('You dip the chicken in the cauldron');
            player.sendSound('fish');
            await world.sleepTicks(3);
            player.inventory.remove(NONENCHANTED_IDS.chicken);
            player.inventory.add(ENCHANTED_IDS.chicken);
            break;
        case NONENCHANTED_IDS.rat:
            player.message('You dip the rat meat in the cauldron');
            player.sendSound('fish');
            await world.sleepTicks(3);
            player.inventory.remove(NONENCHANTED_IDS.rat);
            player.inventory.add(ENCHANTED_IDS.rat);
            break;
        default:
            return false;
    }

    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id === GUARDED_DOOR_ID) {
        if (player.x > wallObject.x - 1) {
            if (player.opponent && player.opponent.id === SUIT_OF_ARMOR_ID) {
                return true;
            }

            const suitOfArmors = player
                .getNearbyEntitiesByID('npcs', SUIT_OF_ARMOR_ID)
                .filter((npc) => {
                    return (
                        !npc.locked && player.localEntities.known.npcs.has(npc)
                    );
                });

            const suitOfArmor =
                suitOfArmors[Math.floor(Math.random() * suitOfArmors.length)];

            if (suitOfArmor) {
                player.message('Suddenly the suit of armour comes to life!');
                suitOfArmor.attack(player);
                return true;
            }
        }

        await player.enterDoor(wallObject);
        return true;
    } else if (wallObject.id === OTHER_DOORS_ID) {
        await player.enterDoor(wallObject);
        return true;
    }

    return false;
}

module.exports = { onUseWithGameObject, onWallObjectCommandOne };
