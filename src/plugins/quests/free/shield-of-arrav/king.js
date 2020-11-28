// https://classic.runescape.wiki/w/Transcript:King

const BLACK_ARM_BROKEN_SHIELD_ID = 54;
const CERTIFICATE_ID = 61;
const KING_ID = 42;
const PHOENIX_BROKEN_SHIELD_ID = 53;

async function claimReward(player) {
    await player.say(
        'Your majesty',
        'I have come to claim the reward',
        'For the return of the shield of Arrav'
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== KING_ID) {
        return false;
    }

    const questStage = player.questStages.shieldOfArrav;
    const blackArmStage = player.cache.blackArmStage || 0;
    const phoenixStage = player.cache.phoenixStage || 0;
    const completedGang = blackArmStage === -1 || phoenixStage === -1;

    player.engage(npc);

    if (player.inventory.has(CERTIFICATE_ID)) {
        const { world } = player;

        await claimReward(player);

        if (questStage === -1) {
            await npc.say(
                'You have already claimed the reward',
                "You can't claim it twice"
            );

            player.message("@que@Why don't you give this certificate");
            await world.sleepTicks(3);

            player.message('@que@To whoever helped you get the shield');
        } else if (completedGang) {
            player.message('@que@You show the certificate to the king');
            await world.sleepTicks(3);

            await npc.say(
                'My goodness',
                'This is the claim for a reward put out by my father',
                "I never thought I'd see anyone claim this reward",
                'I see you are claiming half the reward',
                'So that would come to 600 gold coins'
            );

            player.inventory.remove(CERTIFICATE_ID);
            player.message('@que@You hand over a certificate');
            await world.sleepTicks(3);

            player.inventory.add(10, 600);
            player.message('@que@The king gives you 600 coins');
            await world.sleepTicks(3);

            player.message(
                'Well done, you have completed the shield of Arrav quest'
            );

            player.questStages.shieldOfArrav = -1;
            player.addQuestPoints(1);
            player.message('@gre@You haved gained 1 quest point!');
        } else {
            await npc.say(
                "The name on this certificate isn't yours!",
                "I can't give you the reward",
                'Unless you do the quest yourself'
            );
        }
    } else if (
        player.inventory.has(BLACK_ARM_BROKEN_SHIELD_ID) ||
        player.inventory.has(PHOENIX_BROKEN_SHIELD_ID)
    ) {
        await claimReward(player);

        await npc.say(
            'The shield of Arrav, eh?',
            'Yes, I do recall my father putting a reward out for that',
            'Very well',
            'Go get the authenticity of the shield verified',
            'By the curator at the museum',
            'And I will grant you your reward'
        );
    } else {
        await player.say('Greetings, your majesty');
        await npc.say('Do you have anything of import to say?');
        await player.say('Not really');

        await npc.say(
            'You will have to excuse me then',
            'I am very busy',
            'I have a kingdom to run'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
