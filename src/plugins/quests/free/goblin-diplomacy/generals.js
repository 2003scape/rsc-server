// https://classic.runescape.wiki/w/Transcript:General_Bentnoze

const ARMOUR_ID = 273;
const BENTNOZE_ID = 152;
const BLUE_ARMOUR_ID = 275;
const GOLD_BAR_ID = 172;
const ORANGE_ARMOUR_ID = 274;
const WARTFACE_ID = 151;

function switchGoblins(player, wartface, bentnoze) {
    if (wartface.locked) {
        wartface.locked = false;
        bentnoze.locked = true;
        bentnoze.faceEntity(player);
        player.faceEntity(bentnoze);
    } else {
        bentnoze.locked = false;
        wartface.locked = true;
        wartface.faceEntity(player);
        player.faceEntity(wartface);
    }
}

async function talkToGenerals(player) {
    const { world } = player;
    const questStage = player.questStages.goblinDiplomacy;

    const wartface = world.npcs.getByID(WARTFACE_ID);
    const bentnoze = world.npcs.getByID(BENTNOZE_ID);

    // this prevents other players from talking to him, but lets him roam around
    // while not speaking with us (i personally tested this in classic)
    bentnoze.interlocutor = player;
    player.engage(wartface);

    // in case the user breaks out of an .ask
    const unbusyGenerals = () => {
        if (!player.interlocutor) {
            wartface.interlocutor = null;
            bentnoze.interlocutor = null;
        } else {
            world.setTickTimeout(unbusyGenerals, 2);
        }
    };

    unbusyGenerals();

    if (questStage !== -1 && questStage !== 4) {
        await wartface.say('green armour best');
        switchGoblins(player, wartface, bentnoze);
        await bentnoze.say('No no Red every time');
        switchGoblins(player, wartface, bentnoze);
        await wartface.say('go away human, we busy');
    }

    if (questStage === 1) {
        const choice = await player.ask(
            [
                'Why are you arguing about the colour of your armour?',
                "Wouldn't you prefer peace?",
                'Do you want me to pick an armour colour for you?'
            ],
            true
        );

        switch (choice) {
            case 0: // why argue
                await wartface.say(
                    'We decide to celebrate goblin new century',
                    'By changing the colour of our armour',
                    'Light blue get boring after a bit',
                    'And we want change',
                    'Problem is they want different change to us'
                );
                break;
            case 1: // prefer peace
                await wartface.say(
                    'Yeah peace is good as long as it is peace wearing Green ' +
                        'armour'
                );

                switchGoblins(player, wartface, bentnoze);

                await bentnoze.say(
                    'But green to much like skin!',
                    'Nearly make you look naked!'
                );
                break;
            case 2: // pick a colour
                await player.say('different to either green or red');

                await wartface.say(
                    "Hmm me dunno what that'd look like",
                    "You'd have to bring me some, so us could decide"
                );

                switchGoblins(player, wartface, bentnoze);
                await bentnoze.say('Yep bring us orange armour');
                switchGoblins(player, wartface, bentnoze);
                await wartface.say('Yep orange might be good');

                player.questStages.goblinDiplomacy = 2;
                break;
        }
    } else if (questStage === 2) {
        await wartface.say('Oh it you');

        if (player.inventory.has(ORANGE_ARMOUR_ID)) {
            await player.say('I have some orange armour');

            player.inventory.remove(ORANGE_ARMOUR_ID);
            player.message('@que@You give some goblin armour to the goblins');
            await world.sleepTicks(2);

            await wartface.say("No I don't like that much");
            switchGoblins(player, wartface, bentnoze);
            await bentnoze.say('It clashes with my skin colour');
            switchGoblins(player, wartface, bentnoze);
            await wartface.say('Try bringing us dark blue armour');

            player.questStages.goblinDiplomacy = 3;
        } else {
            await wartface.say('Have you got some orange goblin armour yet?');
            await player.say('Err no');
            await wartface.say('Come back when you have some');
        }
    } else if (questStage === 3) {
        await wartface.say('Oh it you');

        if (player.inventory.has(BLUE_ARMOUR_ID)) {
            await player.say('I have some dark blue armour');

            player.inventory.remove(BLUE_ARMOUR_ID);
            player.message('@que@You give some goblin armour to the goblins');
            await world.sleepTicks(2);

            await wartface.say("Doesn't seem quite right");
            switchGoblins(player, wartface, bentnoze);
            await bentnoze.say('maybe if it was a bit lighter');
            switchGoblins(player, wartface, bentnoze);
            await wartface.say('Yeah try light blue');

            await player.say(
                'I thought that was the armour you were changing from',
                'But never mind, anything is worth a try'
            );

            player.questStages.goblinDiplomacy = 4;
        } else {
            await wartface.say(
                'Have you got some Dark Blue goblin armour yet?'
            );

            await player.say('Err no');
            await wartface.say('Come back when you have some');
        }
    } else if (questStage === 4) {
        if (player.inventory.has(ARMOUR_ID)) {
            await player.say("Ok I've got light blue armour");

            player.inventory.remove(ARMOUR_ID);
            player.message('@que@You give some goblin armour to the goblins');
            await world.sleepTicks(2);

            await wartface.say('That is rather nice');

            switchGoblins(player, wartface, bentnoze);

            await bentnoze.say(
                "Yes I could see myself wearing somethin' like that"
            );

            switchGoblins(player, wartface, bentnoze);

            await wartface.say(
                "It' a deal then",
                'Light blue it is',
                'Thank you for sorting our argument'
            );

            player.message(
                '@que@Well done you have completed the goblin diplomacy quest'
            );

            player.questStages.goblinDiplomacy = -1;
            player.addQuestPoints(5);
            player.message('@gre@You haved gained 5 quest points!');

            player.addExperience(
                'crafting',
                player.skills.crafting.base * 60 + 500,
                false
            );

            player.inventory.add(GOLD_BAR_ID);
            player.message(
                '@que@general wartface gives you a gold bar as thanks'
            );
        } else {
            await wartface.say(
                'Have you got some Light Blue goblin armour yet?'
            );

            await player.say('Err no');
            await wartface.say('Come back when you have some');
        }
    } else if (questStage === -1) {
        await wartface.say(
            "Now you've solved our argument we gotta think of something else " +
                'to do'
        );

        switchGoblins(player, wartface, bentnoze);
        await bentnoze.say('Yep, we bored now');
    }

    player.disengage();

    wartface.locked = false;
    wartface.interlocutor = null;

    bentnoze.locked = false;
    bentnoze.interlocutor = null;

    return true;
}

async function onTalkToNPC(player, npc) {
    if (
        (npc.id !== BENTNOZE_ID && npc.id !== WARTFACE_ID) ||
        player.questStages.dragonSlayer === 2
    ) {
        return false;
    }

    return await talkToGenerals(player);
}

module.exports = { onTalkToNPC };
