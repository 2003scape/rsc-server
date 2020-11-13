// https://classic.runescape.wiki/w/Transcript:Captain_Tobias
// https://classic.runescape.wiki/w/Transcript:Seaman_Lorris
// https://classic.runescape.wiki/w/Transcript:Seaman_Thresnor

const CAPTAIN_TOBIAS_ID = 166;
const SEAMEN_LORRIS_ID = 170;
const SEAMEN_THRESNOR_ID = 171;

const SEAMEN_IDS = new Set([
    CAPTAIN_TOBIAS_ID,
    SEAMEN_LORRIS_ID,
    SEAMEN_THRESNOR_ID
]);

const SHIP_IDS = new Set([155, 156, 157]);

const { karamja } = require('@2003scape/rsc-data/regions');

async function talkToSeaman(player, npc) {
    const { world } = player;

    player.engage(npc);

    await npc.say(
        'Do you want to go on a trip to Karamja?',
        'The trip will cost you 30 gold'
    );

    const choices = ['Yes please', 'No thankyou'];

    if (player.questStages.dragonSlayer !== -1) {
        choices.unshift("I'd rather go to Crandor Isle");
    }

    const choice = await player.ask(choices, true);

    if (choice === 0 && choices.length === 3) {
        // crandor isle
        await npc.say(
            'No I need to stay alive',
            'I have a wife and family to support'
        );
    } else if ((choice === 1 && choices.length === 3) || choice === 0) {
        // yes please
        if (player.inventory.has(10, 30)) {
            player.inventory.remove(10, 30);
            player.message('@que@You pay 30 gold');
            await world.sleepTicks(2);
            player.message('@que@You board the ship');
            await world.sleepTicks(2);
            player.teleport(karamja.spawnX, karamja.spawnY);
            await world.sleepTicks(2);
            player.message('@que@The ship arrives at Karamja');
        } else {
            await player.say("Oh dear I don't seem to have enough money");
        }
    }

    player.disengage();
}

async function onTalkToNPC(player, npc) {
    if (!SEAMEN_IDS.has(npc.id)) {
        return false;
    }

    await talkToSeaman(player, npc);

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (!SHIP_IDS.has(gameObject.id)) {
        return false;
    }

    const { world } = player;

    const tobias = world.npcs.getByID(CAPTAIN_TOBIAS_ID);

    if (
        tobias &&
        !tobias.interlocutor &&
        player.localEntities.known.npcs.has(tobias)
    ) {
        await talkToSeaman(player, tobias);
    } else {
        player.message(
            'I need to speak to the captain before boarding the ship.'
        );
    }

    return true;
}

module.exports = { onTalkToNPC, onGameObjectCommandOne };
