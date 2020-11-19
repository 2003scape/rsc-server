const BRONZE_KEY_ID = 242;
const DOOR_ID = 45;
const LADY_KELI_ID = 123;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    if (player.x < wallObject.x) {
        const { world } = player;
        const ladyKeli = world.npcs.getByID(LADY_KELI_ID);

        if (ladyKeli) {
            player.message(
                "You'd better get rid of Lady Keli before trying to go " +
                    'through there'
            );
        } else {
            player.message('The door is locked');

            if (player.inventory.has(BRONZE_KEY_ID)) {
                player.message('Maybe you should try using your key on it');
            }
        }
    } else {
        player.message('You go through the door');
        player.enterDoor(wallObject);
    }

    return true;
}

async function onUseWithWallObject(player, wallObject, item) {
    if (wallObject.id !== DOOR_ID || item.id !== BRONZE_KEY_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    if (questStage !== 3) {
        player.message('I have no reason to do this');
    } else if (player.x < wallObject.x) {
        const { world } = player;
        const ladyKeli = world.npcs.getByID(LADY_KELI_ID);

        if (ladyKeli) {
            player.message(
                "You'd better get rid of Lady Keli before trying to go " +
                    'through there'
            );
        } else {
            player.message('You unlock the door', 'You go through the door');
            player.enterDoor(wallObject);
        }
    } else {
        player.message('You go through the door');
        player.enterDoor(wallObject);
    }

    return true;
}

module.exports = { onWallObjectCommandOne, onUseWithWallObject };
