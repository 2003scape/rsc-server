// https://classic.runescape.wiki/w/Dragon_(Dragon_Slayer)
// firebreathing handled in ./src/plugins/npcs/dragon.js

const ELVARG_ID = 196;

async function onNPCDeath(player, npc) {
    if (npc.id !== ELVARG_ID) {
        return false;
    }

    if (player.questStages.dragonSlayer === 3) {
        player.teleport(410, 3481);
        player.message('Well done you have completed the dragon slayer quest');

        player.questStages.dragonSlayer = -1;
        player.addQuestPoints(2);
        player.message('@gre@You haved gained 2 quest points!');

        player.addExperience(
            'strength',
            player.skills.strength.base * 1200 + 2600,
            false
        );

        player.addExperience(
            'defense',
            player.skills.strength.base * 1200 + 2600,
            false
        );
    }

    return false;
}

module.exports = { onNPCDeath };
