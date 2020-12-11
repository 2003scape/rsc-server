// https://classic.runescape.wiki/w/Transcript:Head_chef

const CHEFS_HAT_ID = 192;
const DOOR_ID = 43;
const HEAD_CHEF_ID = 133;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const { world } = player;
    const cookingLevel = player.skills.cooking.current;

    if (cookingLevel < 32) {
        const headChef = world.npcs.getByID(HEAD_CHEF_ID);

        if (headChef && !headChef.interlocutor) {
            player.engage(headChef);

            await headChef.say(
                'Sorry. Only the finest chefs are allowed in here'
            );

            player.disengage();
        }

        player.message('You need a cooking level of 32 to enter');

        return true;
    }

    if (!player.inventory.isEquipped(CHEFS_HAT_ID)) {
        const headChef = world.npcs.getByID(HEAD_CHEF_ID);

        if (headChef && !headChef.interlocutor) {
            player.engage(headChef);

            await headChef.say(
                "Where's your chef's hat",
                "You can't come in here unless you're wearing a chef's hat"
            );

            player.disengage();
        } else {
            player.message("You need to wear a chef's hat to enter");
        }

        return true;
    }

    await player.enterDoor(wallObject);

    return true;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== HEAD_CHEF_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Hello welcome to the chef's guild",
        'Only accomplished chefs and cooks are allowed in here',
        'Feel free to use any of our facilities'
    );

    player.disengage();
    return true;
}

module.exports = { onWallObjectCommandOne, onTalkToNPC };
