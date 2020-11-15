// https://classic.runescape.wiki/w/Shopkeeper_(Varrock_Swords)

const SHOPKEEPER_IDS = new Set([56, 130]);

async function onTalkToNPC(player, npc) {
    if (!SHOPKEEPER_IDS.has(npc.id)) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        'Hello bold adventurer',
        'Can I interest you in some swords?'
    );

    const choice = await player.ask(
        ['Yes please', "No, I'm OK for swords right now"],
        true
    );

    switch (choice) {
        case 0: // yes
            player.disengage();
            player.openShop('varrock-swords');
            return true;
        case 1: // no
            await npc.say('Come back if you need any');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
