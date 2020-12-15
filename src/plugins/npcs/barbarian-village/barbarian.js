// https://classic.runescape.wiki/w/Transcript:Barbarian

// also handles gunthor the brave
const BARBARIAN_IDS = new Set([76, 78]);

async function onTalkToNPC(player, npc) {
    if (!BARBARIAN_IDS.has(npc.id)) {
        return false;
    }

    player.engage(npc);
    await player.say('Hello');

    const roll = Math.floor(Math.random() * 11);

    switch (roll) {
        case 0:
            await npc.say('Hello');
            break;
        case 1:
            player.message('The barbarian grunts');
            await player.world.sleepTicks(1);
            break;
        case 2:
            await npc.say('Good day, my dear fellow');
            break;
        case 3:
            await npc.say('ug');
            break;
        case 4:
            player.message('The barbarian ignores you');
            break;
        case 5:
            await npc.say('Grr');
            break;
        case 6:
            await npc.say('Wanna fight?');
            player.disengage();
            await npc.attack(player);
            return true;
        case 7:
            await npc.say(
                "I'm a little busy right now",
                "We're getting ready for our next barbarian raid"
            );
            break;
        case 8:
            await npc.say('Go away', 'This is our village');
            break;
        case 9:
            await npc.say('Who are you?');
            await player.say("I'm a bold adventurer");
            await npc.say("You don't look very strong");
            break;
        case 10:
            await npc.say('Beer?');
            break;
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
