// https://classic.runescape.wiki/w/Transcript:Luthas

const LUTHAS_ID = 164;

async function annoyingOfficer(npc) {
    await npc.say(
        'Well I know her pretty well',
        "She doesn't cause me any trouble any more",
        "She doesn't even search my export crates any more",
        'She knows they only contain bananas'
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== LUTHAS_ID) {
        return false;
    }

    player.engage(npc);

    if (!player.cache.hasOwnProperty('crateBananas')) {
        await npc.say("Hello I'm Luthas, I run the banana plantation here");

        const choice = await player.ask(
            [
                'Could you offer me employment on your plantation?',
                "That customs officer is annoying isn't she?"
            ],
            true
        );

        switch (choice) {
            case 0: // employment
                await npc.say(
                    'Yes, I can sort something out',
                    "Yes there's a crate outside ready for loading up on the " +
                        'ship',
                    'If you could fill it up with bananas',
                    "I'll pay you 30 gold"
                );

                player.cache.crateBananas = 0;
                break;
            case 1: // annoying officer
                await annoyingOfficer(npc);
                break;
        }
    } else if (player.cache.crateBananas < 10) {
        await npc.say('Have you completed your task yet?');

        const choice = await player.ask(
            ['What did I have to do again?', "No, the crate isn't full yet"],
            true
        );

        switch (choice) {
            case 0: // what am i doing
                await npc.say(
                    "There's a crate outside ready for loading up on the ship",
                    'If you could fill it up with bananas',
                    "I'll pay you 30 gold"
                );
                break;
            case 1: // not full
                await npc.say('Well come back when it is');
                break;
        }
    } else {
        await player.say("I've filled a crate with bananas");
        await npc.say('Well done here is your payment');

        player.inventory.add(10, 30);
        player.message('Luthas hands you 30 coins');

        delete player.cache.crateBananas;

        if (player.cache.stashedRum) {
            player.cache.deliveredRum = true;
        }

        const choice = await player.ask(
            [
                'Will you pay me for another crate full?',
                "Thankyou, I'll be on my way",
                'So where are these bananas going to be delivered to?',
                "That customs officer is annoying isn't she?"
            ],
            true
        );

        switch (choice) {
            case 0: // another one
                await npc.say(
                    'Yes certainly',
                    'If you go outside you should see the old crate has ' +
                        'been loaded on to the ship',
                    "and there is another empty crate in it's place"
                );

                player.cache.crateBananas = 0;
                break;
            case 2: // delivered to where
                await npc.say(
                    'I sell them to Wydin who runs a grocery store in Port ' +
                        'Sarim'
                );
                break;
            case 3: // annoying officer
                await annoyingOfficer(npc);
                break;
        }
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
