// https://classic.runescape.wiki/w/Transcript:Redbeard_Frank

const CHEST_KEY_ID = 382;
const FRANK_ID = 128;
const RUM_ID = 318;

async function arrrh(npc) {
    await npc.say('Arrrh');
}

async function wantToTrade(npc) {
    await npc.say("No, I've got nothing to trade");
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== FRANK_ID) {
        return false;
    }

    const questStage = player.questStages.piratesTreasure;

    player.engage(npc);

    await npc.say('Arrrh Matey');

    if (
        !questStage ||
        questStage === -1 ||
        (questStage === 2 &&
            (player.inventory.has(CHEST_KEY_ID) ||
                player.bank.has(CHEST_KEY_ID))) ||
        questStage === 3 ||
        questStage === 4
    ) {
        const choices = ['Arrrh', 'Do you want to trade?'];

        if (!questStage) {
            choices.unshift("I'm in search of treasure");
        }

        let choice = await player.ask(choices, true);

        if (questStage) {
            choice += 1;
        }

        switch (choice) {
            case 0: // treasure
                await npc.say(
                    'Arrrh treasure you be after eh?',
                    'Well I might be able to tell you where to find some.',
                    'For a price'
                );

                await player.say('What sort of price?');

                await npc.say(
                    'Well for example if you can get me a bottle of rum',
                    'Not just any rum mind',
                    "I'd like some rum brewed on Karamja island",
                    "There's no rum like Karamja rum"
                );

                player.questStages.piratesTreasure = 1;
                break;
            case 1: // arrrh
                await arrrh(npc);
                break;
            case 2: // trade
                await wantToTrade(npc);
                break;
        }
    } else if (questStage === 1) {
        await npc.say('Have Ye brought some rum for yer old mate Frank');

        if (player.inventory.has(RUM_ID)) {
            const { world } = player;

            await player.say("Yes I've got some");

            player.inventory.remove(RUM_ID);
            player.message('Frank happily takes the rum');
            await world.sleepTicks(2);

            await npc.say(
                "Now a deals a deal, I'll tell ye about the treasure",
                'I used to serve under a pirate captain called One Eyed Hector',
                'Hector was a very succesful pirate and became very rich',
                'but about a year ago we were boarded by the Royal Asgarnian ' +
                    'Navy',
                'Hector was killed along with many of the crew',
                'I was one of the few to escape',
                'And I escaped with this'
            );

            player.inventory.add(CHEST_KEY_ID);
            player.message('Frank hands you a key');
            player.questStages.piratesTreasure = 2;
            await world.sleepTicks(2);

            await npc.say(
                "This is Hector's key",
                'I believe it opens his chest',
                'In his old room in the blue moon inn in Varrock',
                'With any luck his treasure will be in there'
            );

            const choice = await player.ask(
                [
                    "Ok thanks, I'll go and get it",
                    "So why didn't you ever get it?"
                ],
                true
            );

            if (choice === 1) {
                await npc.say(
                    "I'm not allowed in the blue moon inn",
                    "Apparently I'm a drunken trouble maker"
                );
            }
        } else {
            await player.say('No not yet');
        }
    } else if (questStage === 2) {
        const { world } = player;

        await player.say('I seem to have lost my chest key');

        await npc.say(
            'Arrr silly you',
            'Fortunatly I took the precaution to have another made'
        );

        player.inventory.add(CHEST_KEY_ID);
        player.message('Frank hands you a chest key');
        await world.sleepTicks(2);
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
