// https://classic.runescape.wiki/w/Transcript:Apothecary

const APOTHECARY_ID = 33;
const CADAVABERRIES_ID = 55;
const CADAVA_POTION_ID = 57;

async function onTalkToNPC(player, npc) {
    const questStage = player.questStages.romeoAndJuliet;

    if (
        npc.id !== APOTHECARY_ID ||
        questStage !== 4 &&
        ((questStage !== 5 && player.inventory.has(CADAVA_POTION_ID)) ||
            player.bank.has(CADAVA_POTION_ID))
    ) {
        return false;
    }

    player.engage(npc);

    if (questStage === 4) {
        await player.say(
            'Apothecary. Father Lawrence sent me',
            'I need some Cadava potion to help Romeo and Juliet'
        );

        await npc.say(
            'Cadava potion. Its pretty nasty. And hard to make',
            'Wing of Rat, Tail of frog. Ear of snake and horn of dog',
            'I have all that, but I need some cadavaberries',
            'You will have to find them while I get the rest ready',
            'Bring them here when you have them. But be careful. They are nasty'
        );

        player.questStages.romeoAndJuliet = 5;
    } else if (questStage === 5) {
        if (player.inventory.has(CADAVABERRIES_ID)) {
            const { world } = player;

            await npc.say('Well done. You have the berries');

            player.inventory.remove(CADAVABERRIES_ID);
            player.message('@que@You hand over the berries');
            await world.sleepTicks(2);

            player.message(
                '@que@Which the apothecary shakes up in a vial of strange ' +
                    'liquid'
            );

            await world.sleepTicks(2);

            await npc.say('Here is what you need');
            player.inventory.add(CADAVA_POTION_ID);
        } else {
            await npc.say(
                'Keep searching for the berries',
                'They are needed for the potion'
            );
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
