// https://classic.runescape.wiki/w/Transcript:Cassie

const CASSIE_ID = 101;

async function onTalkToNPC(player, npc) {
    if (npc.id !== CASSIE_ID) {
        return false;
    }

    player.engage(npc);

    await player.say('What wares are you selling?');
    await npc.say('I buy and sell shields', 'Do you want to trade?');

    const choice = await player.ask(['Yes please', 'No thank you'], true);

    if (choice === 0) {
        player.disengage();
        player.openShop('cassies-shields');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
