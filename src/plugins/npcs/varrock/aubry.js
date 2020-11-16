// https://classic.runescape.wiki/w/Transcript:Aubury

const AUBRY_ID = 54;

async function onTalkToNPC(player, npc) {
    if (npc.id !== AUBRY_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Do you want to buy some runes?');

    const choice = await player.ask(
        ['Yes please', "Oh it's a rune shop. No thank you, then"],
        false
    );

    switch (choice) {
        case 0: // yes
            await player.say('Yes Please');
            player.disengage();
            player.openShop('auburys-rune');
            return true;
        case 1: // no
            await player.say("Oh it's a rune shop. No thank you, then");

            await npc.say(
                'Well if you find someone who does want runes,',
                'send them my way'
            );
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
