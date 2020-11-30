const { talkToGenerals } = require('../goblin-diplomacy/generals');

const BENTNOZE_ID = 152;
const WARTFACE_ID = 151;

async function onTalkToNPC(player, npc) {
    if (
        (npc.id !== BENTNOZE_ID && npc.id !== WARTFACE_ID) ||
        player.questStages.dragonSlayer !== 2
    ) {
        return false;
    }

    const { world } = player;
    const wartface = world.npcs.getByID(WARTFACE_ID);
    const bentnoze = world.npcs.getByID(BENTNOZE_ID);

    const unbusyGenerals = () => {
        if (!player.interlocutor) {
            wartface.interlocutor = null;
            bentnoze.interlocutor = null;
        } else {
            world.setTickTimeout(unbusyGenerals, 2);
        }
    };

    unbusyGenerals();

    if (npc.id === BENTNOZE_ID) {
        wartface.interlocutor = player;
    } else {
        bentnoze.interlocutor = player;
    }

    player.engage(npc);

    const choice = await player.ask(
        [
            "I've heard one of your goblins has got a hold of part of a map",
            'So how is life for the goblins?'
        ],
        true
    );

    switch (choice) {
        case 0: // one of your goblins has got a hold of part of a map
            await npc.say("Aha that'd be Wormbrain");
            await player.say('Where would he be');

            await npc.say(
                'Wormbrain he steals to much',
                'He got caught',
                'Now he lives in Port Sarim town jail'
            );
            break;
        case 1: // how is life?
            return talkToGenerals(player);
    }

    wartface.interlocutor = null;
    bentnoze.interlocutor = null;
    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
