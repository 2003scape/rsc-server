// https://classic.runescape.wiki/w/Transcript:Horvik_the_Armourer

const HORVIK_ID = 48;

async function onTalkToNPC(player, npc) {
    if (npc.id !== HORVIK_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Hello, do you need any help?');

    const choice = await player.ask(
        ["No thanks. I'm just looking around", 'Do you want to trade?'],
        true
    );

    if (choice === 1) {
        await npc.say('Yes, I have a fine selection of armour');
        player.disengage();
        player.openShop('horviks-armour');
        return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
