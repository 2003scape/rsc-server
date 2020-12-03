// https://classic.runescape.wiki/w/Transcript:Monk
// https://classic.runescape.wiki/w/Transcript:Abbot_Langley

const ABBOT_LANGLEY_ID = 174;
const MONK_ID = 93;

async function onTalkToNPC(player, npc) {
    if (npc.id !== ABBOT_LANGLEY_ID && npc.id !== MONK_ID) {
        return false;
    }

    const { world } = player;

    player.engage(npc);

    await npc.say('Greetings traveller');

    const choice = await player.ask(
        [
            "Can you heal me? I'm injured",
            "Isn't this place built a bit out the way?"
        ],
        false
    );

    switch (choice) {
        // heal me
        case 0: {
            await player.say('Can you heal me?', "I'm injured");
            await npc.say('Ok');

            player.message('@que@The monk places his hands on your head');
            await world.sleepTicks(3);

            const newHP = Math.min(
                player.skills.hits.base,
                player.skills.hits.current + 5
            );

            player.skills.hits.current = newHP;
            player.sendStats();

            player.message('@que@You feel a little better');
            break;
        }
        case 1: // out of the way
            await player.say("Isn't this place built a bit out the way?");

            await npc.say(
                'We like it that way',
                'We get disturbed less',
                'We still get rather a large amount of travellers',
                'looking for sanctuary and healing here as it is'
            );
            break;
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
