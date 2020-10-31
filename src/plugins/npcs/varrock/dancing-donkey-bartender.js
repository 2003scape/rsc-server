// https://classic.runescape.wiki/w/Transcript:Bartender#Bartender_(Dancing_Donkey_Inn)

const BARTENDER_ID = 520;
const BEER_ID = 193;

async function yesPlease(player, npc) {
    await npc.say("ok then, that's two gold coins please");

    if (player.inventory.has(10, 2)) {
        player.message('you give two coins to the barman');
        player.inventory.remove(10, 2);
        await player.sendInventory();
        player.message('he gives you a cold beer');
        player.inventory.add(BEER_ID);
        await player.sendInventory();
        await npc.say('cheers');
        await player.say('cheers');
    } else {
        player.message("you don't have enough gold");
    }
}

async function noThanks(npc) {
    await npc.say('let me know if you change your mind');
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARTENDER_ID) {
        return false;
    }

    player.engage(npc);
    await player.say('hello', 'can i get you a refreshing beer?');

    const choice = await player.ask(
        ['yes please', 'no thanks', 'how much?'],
        true
    );

    switch (choice) {
        case 0: // yes
            await yesPlease(player, npc);
            break;
        case 1: // no
            await noThanks(npc);
            break;
        // how much
        case 2: {
            await npc.say('two gold pieces a pint', 'so what do you say?');
            const choice = await player.ask(['yes please', 'no thanks'], true);

            switch (choice) {
                case 0: // yes
                    await yesPlease(player, npc);
                    break;
                case 1: // no
                    await noThanks(npc);
            }

            break;
        }
    }

    player.disengage(npc);

    return true;
}

module.exports = { onTalkToNPC };
