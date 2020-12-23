const GAIUS_ID = 228;

async function onTalkToNPC(player, npc) {
    if (npc.id !== GAIUS_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Welcome to my two handed sword shop');

    const choice = await player.ask(["Let's trade", 'thankyou'], false); // sic

    switch (choice) {
        case 0: // let's trade
            await player.say("Let's trade");
            player.disengage();
            player.openShop('gaius-two-handed');
            return true;
        case 1: // thank you, different capitalization
            await player.say('Thankyou');
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
