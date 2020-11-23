// https://classic.runescape.wiki/w/Transcript:Veronica

const VERONICA_ID = 36;

async function onTalkToNPC(player, npc) {
    if (npc.id !== VERONICA_ID) {
        return false;
    }

    const questStage = player.questStages.ernestTheChicken;

    player.engage(npc);

    if (!questStage) {
        await npc.say(
            'Can you please help me?',
            "I'm in a terrible spot of trouble"
        );

        const choice = await player.ask(
            [
                "Aha, sounds like a quest. I'll help",
                "No, I'm looking for something to kill"
            ],
            false
        );

        switch (choice) {
            case 0: // i'll help
                await player.say('Aha, sounds like a quest', "I'll help");

                await npc.say(
                    'Yes yes I suppose it is a quest',
                    'My fiance Ernest and I came upon this house here',
                    'Seeing as we were a little lost',
                    'Ernest decided to go in and ask for directions',
                    'That was an hour ago',
                    'That house looks very spooky',
                    'Can you go and see if you can find him for me?'
                );

                await player.say("Ok, I'll see what I can do");
                await npc.say('Thank you, thank you', "I'm very grateful");

                player.questStages.ernestTheChicken = 1;
                break;
            case 1: // no
                await player.say("No, I'm looking for something to kill");
                await npc.say('Oooh you violent person you');
                break;
        }
    } else if (questStage === 1) {
        await npc.say('Have you found my sweetheart yet?');
        await player.say('No, not yet');
    } else if (questStage === 2) {
        const { world } = player;

        await npc.say('Have you found my sweetheart yet?');
        await player.say("Yes, he's a chicken");

        await npc.say(
            "I know he's not exactly brave",
            "But I think you're being a little harsh"
        );

        await player.say(
            "No no he's been turned into an actual chicken",
            'By a mad scientist'
        );

        player.message('@que@Veronica lets out an ear piercing shreek');
        await world.sleepTicks(3);

        await npc.say(
            'Eeeeek',
            'My poor darling',
            'Why must these things happen to us?'
        );

        await player.say("Well I'm doing my best to turn him back");

        await npc.say(
            'Well be quick',
            "I'm sure being a chicken can't be good for him"
        );
    } else if (questStage === -1) {
        await npc.say('Thank you for rescuing Ernest');
        await player.say('Where is he now?');

        await npc.say(
            'Oh he went off to talk to some green warty guy',
            "I'm sure he'll be back soon"
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
