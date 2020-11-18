// https://classic.runescape.wiki/w/Transcript:Wayne

const WAYNE_ID = 141;

async function onTalkToNPC(player, npc) {
    if (npc.id !== WAYNE_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Welcome to Wayne's chains",
        'Do you wanna buy or sell some chain mail?'
    );

    const choice = await player.ask(['Yes please', 'No thanks'], true);

    if (choice === 0) {
        player.disengage();
        player.openShop('waynes-chains');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
