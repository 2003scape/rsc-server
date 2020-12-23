const JATIX_ID = 230;

async function onTalkToNPC(player, npc) {
    if (npc.id !== JATIX_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hello how can I help you?');

    const choice = await player.ask(
        [
            'What are you selling?',
            "You can't, I'm beyond help",
            "I'm okay, thankyou" // sic
        ],
        true
    );

    player.disengage();

    if (choice === 0) {
        // what are you selling?
        player.openShop('jatixs-herblaw');
    }

    return true;
}

module.exports = { onTalkToNPC };
