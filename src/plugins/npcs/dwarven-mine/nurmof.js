// https://classic.runescape.wiki/w/Transcript:Nurmof

const NURMOF_ID = 773;

async function onTalkToNPC(player, npc) {
    if (npc.id !== NURMOF_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        'greetings welcome to my pickaxe shop',
        'Do you want to buy my premium quality pickaxes'
    );

    const choice = await player.ask(
        [
            'Yes please',
            'No thankyou',
            'Are your pickaxes better than other pickaxes then?'
        ],
        true
    );

    switch (choice) {
        case 0: // yes
            player.disengage();
            player.openShop('nurmofs-pickaxe');
            return true;
        case 2: // better?
            await npc.say(
                'Of course they are',
                'My pickaxes are made of higher grade metal than your ' +
                    'ordinary bronze pickaxes',
                'Allowing you to have multiple swings at a rock until you ' +
                    'get the ore from it'
            );
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
