// https://classic.runescape.wiki/w/Transcript:Zaff

const ZAFF_ID = 69;

async function onTalkToNPC(player, npc) {
    if (npc.id !== ZAFF_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Would you like to buy or sell some staffs?');
    const choice = await player.ask(['Yes please', 'No, thank you'], true);

    if (choice === 0) {
        player.disengage();
        player.openShop('zaffs-superior-staves');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
