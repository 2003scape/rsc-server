// https://classic.runescape.wiki/w/Transcript:Silk_trader

const SILK_ID = 200;
const SILK_TRADER_ID = 71;

async function onTalkToNPC(player, npc) {
    if (npc.id !== SILK_TRADER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Do you want to buy any fine silks?');

    const choice = await player.ask(
        ['How much are they?', "No. Silk doesn't suit me"],
        true
    );

    if (choice === 0) {
        await npc.say('3 coins');

        const choice = await player.ask(
            ["No. That's too much for me", 'OK, that sounds good'],
            false
        );

        switch (choice) {
            // no
            case 0: {
                await player.say("No. That's too much for me");
                await npc.say(
                    "Two coins and that's as low as I'll go",
                    "I'm not selling it for less",
                    "You'll probably go and sell it in Varrock for a profit " +
                        'anyway'
                );

                const choice = await player.ask(
                    ['Two coins sounds good', "No, really. I don't want it"],
                    true
                );

                switch (choice) {
                    case 0: // sounds good
                        player.message('You buy some silk for 2 coins');

                        if (player.inventory.has(10, 2)) {
                            player.inventory.remove(10, 2);
                            player.inventory.add(SILK_ID);
                        } else {
                            await player.say(
                                "Oh dear. I don't have enough money"
                            );
                        }
                        break;
                    case 1: // no
                        await npc.say(
                            "Ok, but that's the best price you're going to get"
                        );
                        break;
                }
                break;
            }
            case 1: // ok
                await player.say('Ok, that sounds good');

                if (player.inventory.has(10, 3)) {
                    player.inventory.remove(10, 3);
                    player.inventory.add(SILK_ID);
                    player.message('You buy some silk for 3 coins');
                } else {
                    await player.say("Oh dear. I don't have enough money");
                }
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
