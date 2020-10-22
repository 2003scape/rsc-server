// https://classic.runescape.wiki/w/Transcript:Bartender#Bartender_(Flying_Horse_Inn)

const BARTENDER_ID = 340;
const BEER_ID = 193;

async function onTalkToNPC(player, npc) {
    if (npc.id !== BARTENDER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say('Would you like to buy a drink?');
    await player.say('What do you serve?');
    await npc.say('Beer');

    const choice = await player.ask([
        "I'll have a beer then",
        "I'll not have anything then"
    ], true);

    if (choice === 0) {
        await npc.say("Ok, that'll be two coins");

        if (player.inventory.has(10, 2)) {
            player.inventory.remove(10, 2);
            player.inventory.add(BEER_ID);
            player.message('You buy a pint of beer');
        } else {
            await player.say("Oh dear. I don't seem to have enough money");
        }
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
