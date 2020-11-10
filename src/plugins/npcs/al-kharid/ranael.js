// https://classic.runescape.wiki/w/Transcript:Ranael

const RANAEL_ID = 103;

async function onTalkToNPC(player, npc) {
    if (npc.id !== RANAEL_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        'Do you want to buy any armoured skirts?',
        'Designed especially for ladies who like to fight'
    );

    const choice = await player.ask(
        ['Yes please', "No thank you that's not my scene"],
        true
    );

    if (choice === 0) {
        player.disengage();
        player.openShop('ranaels-plateskirt');
        return true;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
