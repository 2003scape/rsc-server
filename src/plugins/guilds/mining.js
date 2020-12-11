// https://classic.runescape.wiki/w/Transcript:Dwarf_(Mining_Guild)

const DOOR_ID = 55;
const DWARF_ID = 191;
const LADDER_ID = 223;

async function checkMiningLevel(player) {
    const miningLevel = player.skills.mining.current;

    if (miningLevel >= 60) {
        return true;
    }

    const dwarf = player.getNearestEntityByID('npcs', DWARF_ID);

    if (dwarf && !dwarf.interlocutor) {
        player.engage(dwarf);
        await dwarf.say('Sorry only the top miners are allowed in there');
        player.disengage();
    }

    player.message('You need a mining of level 60 to enter');

    return false;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== LADDER_ID) {
        return false;
    }

    if (await checkMiningLevel(player)) {
        player.climb(gameObject, false);
        player.message('You climb down the ladder');
    }

    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id !== DOOR_ID) {
        return false;
    }

    if (await checkMiningLevel(player)) {
        await player.enterDoor(wallObject);
    }

    return true;
}

module.exports = { onGameObjectCommandOne, onWallObjectCommandOne };
