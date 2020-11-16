// https://classic.runescape.wiki/w/Transcript:Betty

const BETTY_ID = 149;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BETTY_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Welcome to the magic emporium');

    const choice = await player.ask(
        ['Can I see your wares?', "Sorry I'm not into magic"],
        true
    );

    if (choice === 0) {
        await npc.say('Yes');
        player.disengage();
        player.openShop('bettys-magic-emporium');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
