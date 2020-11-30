const ELVARG_DOOR_ID = 59;
const SECRET_PASSAGE_ID = 58;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id === ELVARG_DOOR_ID) {
        if (player.x >= wallObject.x || player.questStages.dragonSlayer === 3) {
            await player.enterDoor(wallObject);
        } else {
            player.message('the door is locked');
        }

        return true;
    } else if (wallObject.id === SECRET_PASSAGE_ID) {
        if (player.y >= wallObject.y) {
            if (player.cache.karamjaSecretPasasge) {
                player.message('You just went through a secret door');
                await player.enterDoor(wallObject);
            } else {
                player.message('nothing interesting happens');
            }
        } else {
            player.message('You just went through a secret door');
            await player.enterDoor(wallObject);

            if (!player.cache.karamjaSecretPasasge) {
                player.message('You remember where the door is for future use');
                delete player.cache.nedInShip;
                player.cache.karamjaSecretPasasge = true;
            }
        }

        return true;
    }

    return false;
}

module.exports = { onWallObjectCommandOne };
