// https://classic.runescape.wiki/w/Transcript:Guildmaster

const GUILDMASTER_ID = 111;

async function whatIsThisPlace(npc) {
    await npc.say(
        "This is the champions' guild",
        'Only adventurers who have proved themselves worthy',
        'by gaining influence from quests are allowed in here',
        'As the number of quests in the world rises',
        'So will the requirements to get in here',
        'But so will the rewards'
    );
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== GUILDMASTER_ID) {
        return false;
    }

    const questStage = player.questStages.dragonSlayer;

    player.engage(npc);

    if (questStage === -1) {
        await whatIsThisPlace(npc);
    } else {
        const choice = await player.ask(
            [
                'What is this place?',
                'Do you know where I could get a rune plate mail body?'
            ],
            true
        );

        switch (choice) {
            case 0: // what is this place
                await whatIsThisPlace(npc);
                break;
            case 1: // rune plate
                await npc.say(
                    'I have a friend called Oziach who lives by the cliffs',
                    'He has a supply of rune plate mail',
                    "He may sell you some if you're lucky, he can be a " +
                        'little strange though'
                );

                if (!questStage || questStage < 1) {
                    player.questStages.dragonSlayer = 1;
                }
                break;
        }
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
