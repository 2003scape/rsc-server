// https://classic.runescape.wiki/w/Transcript:Lowe

const LOWE_ID = 58;

async function onTalkToNPC(player, npc) {
    if (npc.id !== LOWE_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Welcome to Lowe's Archery Store",
        'Do you want to see my wares?'
    );

    const choice = await player.ask(
        ['Yes please', 'No, I prefer to bash things close up'],
        false
    );

    if (choice === 0) {
        await player.say('Yes Please');
        player.disengage();
        player.openShop('lowes-archery');
        return true;
    } else {
        await player.say('No, I prefer to bash things close up');
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
