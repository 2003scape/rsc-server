// https://classic.runescape.wiki/w/Transcript:Guildmaster
// https://classic.runescape.wiki/w/Transcript:Scavvo
// https://classic.runescape.wiki/w/Transcript:Valaine

const DOOR_ID = 44;
const GUILDMASTER_ID = 111;
const SCAVVO_ID = 183;
const VALAINE_ID = 112;

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

async function onTalkToNPC(player, npc) {
    if (npc.id === SCAVVO_ID) {
        player.engage(npc);

        await npc.say('Ello matey', 'Want to buy some exciting new toys?');

        const choice = await player.ask(
            [
                'No, toys are for kids',
                'Lets have a look then',
                'Ooh goody goody toys'
            ],
            true
        );

        if (choice > 0) {
            player.disengage();
            player.openShop('scavvos-rune');
            return true;
        }

        player.disengage();
        return true;
    } else if (npc.id === VALAINE_ID) {
        player.engage(npc);

        await npc.say(
            'Hello there.',
            "Want to have a look at what we're selling today?"
        );

        const choice = await player.ask(['Yes please', 'No thank you'], true);

        if (choice === 0) {
            player.disengage();
            player.openShop('valaines-shop-of-champions');
            return true;
        }

        player.disengage();
        return true;
    }

    return false;
}

module.exports = { onWallObjectCommandOne, onTalkToNPC };
