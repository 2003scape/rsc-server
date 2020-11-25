// https://classic.runescape.wiki/w/Count_Draynor

const COUNT_DRAYNOR_ID = 96;
const GARLIC_ID = 218;
const HAMMER_ID = 168;
const STAKE_ID = 217;

async function onNPCAttack(player, npc) {
    if (npc.id !== COUNT_DRAYNOR_ID) {
        return false;
    }

    if (player.inventory.has(GARLIC_ID)) {
        player.message('The vampire appears to weaken');

        for (const skillName of ['attack', 'strength', 'defense']) {
            npc.skills[skillName].current = Math.floor(
                npc.skills[skillName].base * 0.75
            );
        }
    }

    return false;
}

async function onNPCDeath(player, npc) {
    if (npc.id !== COUNT_DRAYNOR_ID) {
        return false;
    }

    const questStage = player.questStages.vampireSlayer;

    if (
        player.inventory.has(HAMMER_ID) &&
        player.inventory.isEquipped(STAKE_ID)
    ) {
        player.inventory.remove(STAKE_ID);
        player.message('You hammer the stake in to the vampires chest!');

        if (questStage === 1) {
            player.message(
                'Well done you have completed the vampire slayer quest'
            );

            player.addExperience(
                'attack',
                player.skills.attack.base * 600 + 1300,
                false
            );

            player.questStages.vampireSlayer = -1;
            player.addQuestPoints(3);
            player.message('@gre@You haved gained 3 quest points');
        }

        // return false so he dies as normal
        return false;
    }

    npc.skills.hits.current = npc.skills.hits.base;
    player.message('The vampire seems to regenerate');

    return true;
}

module.exports = { onNPCAttack, onNPCDeath };
