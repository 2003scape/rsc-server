// https://classic.runescape.wiki/w/Delrith
// https://classic.runescape.wiki/w/Transcript:Delrith

const DELRITH_ID = 35;
const SILVERLIGHT_ID = 52;

async function onNPCAttack(player, npc) {
    if (npc.id !== DELRITH_ID) {
        return false;
    }

    const questStage = player.questStages.demonSlayer;

    if (!questStage || questStage === 1) {
        await player.say("I'd rather not. He looks scary");
        return true;
    } else if (questStage === 2) {
        if (player.inventory.isEquipped(SILVERLIGHT_ID)) {
            player.message(
                'As you strike the demon with silverlight he appears to ' +
                    'weaken a lot'
            );

            for (const skillName of ['attack', 'strength', 'defense']) {
                npc.skills[skillName].current = Math.floor(
                    npc.skills[skillName].base * 0.75
                );
            }

            return false;
        } else {
            await player.say("Maybe I'd better wield silverlight first");
            return true;
        }
    } else if (questStage === -1) {
        player.message("You've already done that quest");
        return true;
    }
}

async function onNPCDeath(player, npc) {
    if (
        npc.id !== DELRITH_ID ||
        player.questStages.demonSlayer !== 2 ||
        !player.inventory.isEquipped(SILVERLIGHT_ID)
    ) {
        return false;
    }

    if (player.delrithPrompt) {
        npc.skills.hits.current = npc.skills.hits.base;
        return true;
    } else {
        const { world } = player;

        npc.skills.hits.current = npc.skills.hits.base;
        player.delrithPrompt = true;
        player.message('As you strike Delrith a vortex opens up');
        await world.sleepTicks(3);
        await player.say('Now what was that incantation again');

        const choice = await player.ask(
            [
                'Carlem Gabindo Purchai Zaree Camerinthum',
                'Purchai Zaree Gabindo Carlem Camerinthum',
                'Purchai Camerinthum Aber Gabindo Carlem',
                'Carlem Aber Camerinthum Purchai Gabindo'
            ],
            true
        );

        if (choice === 3) {
            player.message(
                'Delrith is sucked back into the dark dimension from which ' +
                    'he came'
            );

            await world.sleepTicks(3);

            delete player.cache.traibornBones;

            player.message('You have completed the demonslayer quest');
            player.questStages.demonSlayer = -1;
            player.addQuestPoints(3);
            player.message('@gre@You haved gained 3 quest points!');

            return false;
        } else {
            delete player.delrithPrompt;

            player.message(
                'As you chant, Delrith is sucked towards the vortex'
            );

            await world.sleepTicks(3);

            player.message(
                'Suddenly the vortex closes',
                'And Delrith is still here',
                'That was the wrong incantation'
            );

            return true;
        }
    }
}

module.exports = { onNPCAttack, onNPCDeath };
