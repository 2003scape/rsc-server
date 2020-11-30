// https://classic.runescape.wiki/w/Transcript:Oracle

const ORACLE_ID = 197;

const WISE_KNOWLEDGE = [
    'You must search from within to find your true destiny',
    'No crisps at the party',
    'It is cunning, almost foxlike',
    "Is it waking up time, I'm not quite sure",
    'When in Asgarnia do as the Asgarnians do',
    'The light at the end of the tunnel is the demon infested lava pit',
    'Watch out for cabbages they are green and leafy',
    'Too many cooks spoil the anchovie pizza'
];

async function wiseKnowledge(npc) {
    const message =
        WISE_KNOWLEDGE[Math.floor(Math.random() * WISE_KNOWLEDGE.length)];

    await npc.say(message);
}

async function seekMapPiece(npc) {
    await npc.say(
        "The map's behind a door below",
        'But entering is rather tough',
        'And this is what you need to know',
        'You must have the following stuff',
        'First a drink used by the mage',
        'Next some worm string, changed to sheet',
        'Then a small crustacean cage',
        "Last a bowl that's not seen heat"
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== ORACLE_ID) {
        return false;
    }

    const questStage = player.questStages.dragonSlayer;

    player.engage(npc);

    if (questStage === 2) {
        const choice = await player.ask(
            [
                'I seek a piece of the map of the isle of Crondor',
                'Can you impart your wise knowledge to me oh oracle'
            ],
            true
        );

        switch (choice) {
            case 0: // seek map piece
                await seekMapPiece(npc);
                break;
            case 1: // impart knowledge
                await wiseKnowledge(npc);
                break;
        }
    } else {
        await player.say('Can you impart your wise knowledge to me oh oracle');
        await wiseKnowledge(npc);
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
