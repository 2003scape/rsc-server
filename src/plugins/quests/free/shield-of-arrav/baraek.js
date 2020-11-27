// https://classic.runescape.wiki/w/Transcript:Baraek

async function whereIsPhoenix(player, npc) {
    await npc.say('Sh Sh, not so loud', "You don't want to get me in trouble");
    await player.say('So do you know where they are?');

    await npc.say(
        'I may do',
        "Though I don't want to get into trouble for revealing their hideout",
        'Now if I was say 20 gold coins richer',
        'I may happen to be more inclined to take that sort of risk '
    );

    const choice = await player.ask(
        [
            'Okay have 20 gold coins',
            "No I don't like things like bribery",
            "Yes I'd like to be 20 gold coins richer too"
        ],
        true
    );

    switch (choice) {
        case 0: // okay
            if (player.inventory.has(10, 20)) {
                player.inventory.remove(10, 20);

                await npc.say(
                    'Cheers',
                    'Ok to get to the gang hideout',
                    'After entering Varrock through the south gate',
                    'If you take the first turning east',
                    'Somewhere along there is an alleyway to the south',
                    'The door at the end of there is the entrance to the ' +
                        'phoenix gang',
                    "They're operating there under the name of the VTAM " +
                        'corporation',
                    'Be careful',
                    "The phoenix gang ain't the types to be messed with"
                );

                await player.say('Thanks');

                if (!player.cache.phoenixStage) {
                    player.cache.phoenixStage = 1;
                }
            } else {
                await npc.say("Oops. I don't have 20 coins. Silly me.");
            }
            break;
        case 1: // don't like bribery
            await npc.say(
                'Heh, if you wanna deal with the phoenix gang',
                "They're involved in much worse than a bit of bribery"
            );
            break;
    }
}

module.exports = { whereIsPhoenix };
