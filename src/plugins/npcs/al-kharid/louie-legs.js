// https://classic.runescape.wiki/w/Louie_Legs

const LOUIE_ID = 85;

async function onTalkToNPC(player, npc) {
    if (npc.id !== LOUIE_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hey, wanna buy some armour?');

    const choice = await player.ask(
        ['What have you got?', 'No, thank you'],
        true
    );

    if (choice === 0) {
        await npc.say('Take a look, see');
        player.disengage();
        player.openShop('louies-legs');
        return true;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
