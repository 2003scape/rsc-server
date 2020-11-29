// https://classic.runescape.wiki/w/Transcript:Duke_of_Lumbridge

const ANTI_DRAGON_BREATH_SHIELD_ID = 420;
const DUKE_ID = 198;

async function onTalkToNPC(player, npc) {
    if (npc.id !== DUKE_ID) {
        return false;
    }

    const questStage = player.questStages.dragonSlayer;

    const seekShield =
        (questStage === -1 || questStage >= 2) &&
        !player.inventory.has(ANTI_DRAGON_BREATH_SHIELD_ID);

    player.engage(npc);

    await npc.say('Greetings welcome to my castle');

    const choices = ['Have you any quests for me?', 'Where can I find money?'];

    if (seekShield) {
        choices.unshift(
            'I seek a shield that will protect me from dragon breath'
        );
    }

    let choice = await player.ask(choices, true);

    if (!seekShield) {
        choice += 1;
    }

    switch (choice) {
        case 0: // seek shield
            await npc.say(
                'A knight going on a dragon quest hmm?',
                'A most worthy cause',
                'Guard this well my friend'
            );

            player.inventory.add(ANTI_DRAGON_BREATH_SHIELD_ID);
            player.message('@que@The duke hands you a shield');
            break;
        case 1: // quests
            await npc.say('All is well for me');
            break;
        case 2: // money
            await npc.say(
                "I've heard the blacksmiths are prosperous amoung the " +
                    'peasantry',
                'Maybe you could try your hand at that'
            );
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
