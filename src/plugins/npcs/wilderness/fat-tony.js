// https://classic.runescape.wiki/w/Transcript:Fat_Tony

const FAT_TONY_ID = 235;

async function canIHavePizza(player, npc) {
    await npc.say(
        'Well this pizza is really meant to be for the bandits',
        'I guess I could sell you some pizza bases though'
    );

    const choice = await player.ask(
        ['Yes, Okay', "Oh if I have to pay I don't want any"],
        true
    );

    if (choice === 0) {
        player.disengage();
        player.openShop('pizza-base');
        return true;
    }

    player.disengage();
    return true;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== FAT_TONY_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say("Go away I'm very busy");

    const choice = await player.ask(
        [
            'Sorry to disturb you',
            'What are you busy doing?',
            'Have you anything to sell?'
        ],
        true
    );

    switch (choice) {
        // what are you doing
        case 1: {
            await npc.say(
                "I'm cooking pizzas for the people in this camp",
                'Not that these louts appreciate my gourmet cooking'
            );

            const choice = await player.ask(
                [
                    'So what is a gourmet chef doing cooking for bandits?',
                    'Can I have some pizza too?',
                    "Okay, I'll leave you to it"
                ],
                true
            );

            switch (choice) {
                // cooking for bandits
                case 0: {
                    await npc.say(
                        "Well I'm an outlaw",
                        'I was accused of giving the king food poisoning',
                        'The thought of it - I think he just drank to much ' +
                            'wine that night',
                        'I had to flee the kingdom of Misthalin',
                        'The bandits give me refuge here as long as I cook ' +
                            'for them'
                    );

                    const choice = await player.ask(
                        [
                            'Can I have some pizza too?',
                            "Okay, I'll leave you to it"
                        ],
                        true
                    );

                    if (choice === 0) {
                        return await canIHavePizza(player, npc);
                    }
                    break;
                }
                case 1: // can i have pizza
                    return await canIHavePizza(player, npc);
            }
            break;
        }
        case 2: // anything to sell
            await npc.say('Well I guess I can sell you some half made pizzas');
            player.openShop('pizza-base');
            player.disengage();
            return true;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
