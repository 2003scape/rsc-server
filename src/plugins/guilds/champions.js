// https://classic.runescape.wiki/w/Transcript:Guildmaster

const DOOR_ID = 44;
const GUILDMASTER_ID = 111;

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    if (player.questPoints < 32) {
        const { world } = player;
        const guildmaster = world.npcs.getByID(GUILDMASTER_ID);

        if (
            guildmaster &&
            !guildmaster.locked &&
            player.localEntities.known.npcs.has(guildmaster)
        ) {
            player.engage(guildmaster);

            await guildmaster.say(
                'You have not proven yourself worthy to enter here yet'
            );

            player.disengage();
        }

        player.message(
            "@que@The door won't open - you need at least 32 quest points"
        );
    } else {
        await player.enterDoor(wallObject);
    }

    return true;
}

module.exports = { onWallObjectCommandOne };
