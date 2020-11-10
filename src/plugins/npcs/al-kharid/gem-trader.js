// https://classic.runescape.wiki/w/Transcript:Gem_trader

const GEM_TRADER_ID = 308;

async function onTalkToNPC(player, npc) {
    if (npc.id !== GEM_TRADER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        `good day to you ${player.isMale() ? 'sir' : 'madam'}`,
        'Would you be interested in buying some gems?'
    );

    const choice = await player.ask(['Yes please', 'No thankyou'], true);

    if (choice === 0) {
        player.disengage();
        player.openShop('al-kharid-gem-stall');
        return true;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
