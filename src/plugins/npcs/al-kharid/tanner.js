// https://classic.runescape.wiki/w/Transcript:Tanner

const HIDE_ID = 147;
const LEATHER_ID = 148;
const TANNER_ID = 172;

async function onTalkToNPC(player, npc) {
    if (npc.id !== TANNER_ID) {
        return false;
    }

    const { world } = player;

    player.engage(npc);
    await npc.say("Greeting friend I'm a manufacturer of leather");

    const choice = await player.ask([
        'Can I buy some leather then?',
        "Here's some cow hides, can I buy some leather now?",
        'Leather is rather weak stuff'
    ], false);

    switch (choice) {
        case 0: // buy
            await player.say('Can I buy some leather then?');
            await npc.say(
                'I make leather from cow hides',
                'Bring me some of them and a gold coin per hide'
            );
            break;
        case 1: // hides
            await player.say(
                "Here's some cow hides, Can I buy some leather now?"
            );

            await npc.say('Ok');

            do {
                if (!player.inventory.has(10)) {
                    await player.say("I don't have any coins left now");
                    break;
                }

                if (!player.inventory.has(HIDE_ID)) {
                    await player.say("I don't have any cow hides left now");
                    break;
                }

                player.inventory.remove(10, 1);
                player.inventory.remove(HIDE_ID);
                player.inventory.add(LEATHER_ID);
                player.message('You swap a cow hide for a piece of leather');
                await world.sleepTicks(2);
            } while (true);
            break;
        case 2: // weak stuff
            await player.say('Leather is rather weak stuff');
            await npc.say(
                "Well yes if all you're concerned with how much it will " +
                    'protect you in a fight'
            );
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
