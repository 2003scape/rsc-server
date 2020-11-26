// https://classic.runescape.wiki/w/Transcript:Sir_Vyvin

const SIR_VYVIN_ID = 138;

async function onTalkToNPC(player, npc) {
    if (npc.id !== SIR_VYVIN_ID) {
        return false;
    }

    player.engage(npc);

    await player.say('Hello');
    await npc.say('Greetings traveller');

    const choice = await player.ask(
        [
            'Do you have anything to trade?',
            'Why are there so many knights in this city?'
        ],
        true
    );

    switch (choice) {
        case 0: // trade
            await npc.say("No I'm sorry");
            break;
        case 1: // knights
            await npc.say(
                'We are the White Knights of Falador',
                'We are the most powerfull order of knights in the land',
                'We are helping the king Vallance rule the kingdom',
                'As he is getting old and tired'
            );
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
