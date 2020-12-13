// https://classic.runescape.wiki/w/Transcript:Master_Crafter

const BROWN_APRON_ID = 191;
const DOOR_ID = 68;
const MASTER_CRAFTER_ID = 231;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    const { world } = player;
    const craftingLevel = player.skills.crafting.current;

    if (craftingLevel < 40) {
        const masterCrafter = world.npcs.getByID(MASTER_CRAFTER_ID);

        if (masterCrafter && !masterCrafter.interlocutor) {
            player.engage(masterCrafter);

            await masterCrafter.say(
                'Sorry only experienced craftsmen are allowed in here'
            );

            player.disengage();
        }

        player.message('You need a crafting level of 40 to enter the guild');

        return true;
    }

    if (!player.inventory.isEquipped(BROWN_APRON_ID)) {
        const masterCrafter = world.npcs.getByID(MASTER_CRAFTER_ID);

        if (masterCrafter && !masterCrafter.interlocutor) {
            player.engage(masterCrafter);

            await masterCrafter.say(
                "Where's your brown apron?",
                "You can't come in here unless you're wearing a brown apron"
            );

            player.disengage();
        } else {
            player.message('You need to wear a brown apron to enter');
        }

        return true;
    }

    await player.enterDoor(wallObject);

    return true;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== MASTER_CRAFTER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Hello welcome to the Crafter's guild",
        'Accomplished crafters all over the land come here',
        'All to use our top notch workshops'
    );

    player.disengage();
    return true;
}

module.exports = { onWallObjectCommandOne, onTalkToNPC };
