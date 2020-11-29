const DOOR_ID = 57;
const KEY_ITEM_IDS = [268, 200, 375, 340];

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    if (player.x < wallObject.x) {
        await player.enterDoor(wallObject);
    } else {
        const questStage = player.questStages.dragonSlayer;
        let unlocked = true;

        if (questStage === 2) {
            for (const itemID of KEY_ITEM_IDS) {
                if (!player.inventory.has(itemID)) {
                    unlocked = false;
                    break;
                }
            }
        } else {
            unlocked = false;
        }

        if (unlocked) {
            await player.enterDoor(wallObject);
            player.cache.dwarvenChestMapPiece = true;
        } else {
            player.message('the door is locked');
        }
    }

    return true;
}

module.exports = { onWallObjectCommandOne };
