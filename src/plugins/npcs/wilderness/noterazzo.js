// https://classic.runescape.wiki/w/Transcript:Noterazzo

const NOTERAZZO_ID = 233;

async function onTalkToNPC(player, npc) {
    if (npc.id !== NOTERAZZO_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say("Hey wanna trade?, I'll give the best deals you can find");

    const choice = await player.ask(
        [
            'Yes please',
            'No thankyou',
            'How can you afford to give such good deals?'
        ],
        true
    );

    switch (choice) {
        case 0: // yes
            player.disengage();
            player.openShop('bandit-camp-general');
            return true;
        case 2: // good deals
            await npc.say(
                'The general stores in Asgarnia and Misthalin are heavily ' +
                    'taxed',
                'It really makes it hard for them to run an effective buisness',
                "For some reason taxmen don't visit my store"
            );

            player.message('Noterazzo winks at you');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
