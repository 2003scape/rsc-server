// https://classic.runescape.wiki/w/Transcript:Gerrant

const GERRANT_ID = 167;

async function onTalkToNPC(player, npc) {
    if (npc.id !== GERRANT_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        'Welcome you can buy fishing equipment at my store',
        "We'll also buy anything you catch off you"
    );

    const choice = await player.ask(
        ["Let's see what you've got then", "Sorry, I'm not interested"],
        false
    );

    switch (choice) {
        case 0:
            await player.say("Let's see what you've got then");
            player.disengage();
            player.openShop('gerrants-fishy-business');
            return true;
        case 1:
            await player.say("Sorry,I'm not interested");
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
