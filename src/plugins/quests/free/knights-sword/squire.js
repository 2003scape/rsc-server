// https://classic.runescape.wiki/w/Transcript:Squire

const FALADIAN_KNIGHTS_SWORD_ID = 265;
const PORTRAIT_ID = 264;
const SQUIRE_ID = 132;

async function findItSoon(npc) {
    await npc.say(
        'Yes me too',
        "I'm not looking forward to telling Vyvin I've lost it",
        "He's going to want it for the parade next week as well"
    );
}

async function dwarvesMakeAnother(player, npc) {
    await npc.say(
        "I'm not a hundred percent sure the Imcando tribe exists anymore",
        'I should think Reldo the palace librarian in Varrock will know',
        'He has done a lot of research on the races of Runescape',
        "I don't suppose you could try and track down the Imcando dwarves " +
            'for me?',
        "I've got so much work to do"
    );

    const choice = await player.ask(
        ["Ok I'll give it a go", "No I've got lots of mining work to do"],
        true
    );

    if (choice === 0) {
        await npc.say(
            'Thankyou very much',
            'As I say the best place to start should be with Reldo'
        );

        player.questStages.theKnightsSword = 1;
    }
}

async function vagueArea(player, npc) {
    await npc.say(
        'No I was carrying it for him all the way from where he had it ' +
            'stored in Lumbridge',
        'It must have slipped from my pack during the trip',
        'And you know what people are like these days',
        'Someone will have just picked it up and kept it for themselves'
    );

    const choice = await player.ask(
        [
            'I can make a new sword if you like',
            'Well the kingdom is fairly abundant with swords',
            'Well I hope you find it soon'
        ],
        true
    );

    switch (choice) {
        case 0: // new sword
            await newSword(player, npc);
            break;
        case 1: // sword abundance
            await swordAbundance(player, npc);
            break;
        case 2: // find it soon
            await findItSoon(player, npc);
            break;
    }
}

async function familyHeirloom(player, npc) {
    await npc.say(
        "It has been passed down through Vyvin's family for five generations",
        'It was originally made by the Imcando Dwarves',
        'Who were a particularly skilled tribe of dwarven smiths',
        'I doubt anyone could make it in the style they do'
    );

    const choice = await player.ask(
        [
            'So would these dwarves make another one?',
            'Well I hope you find it soon',
            'Is he angry?'
        ],
        true
    );

    switch (choice) {
        case 0: // dwarves make another
            await dwarvesMakeAnother(player, npc);
            break;
        case 1: // find it soon
            await findItSoon(npc);
            break;
        case 2: // angry
            await isHeAngry(player, npc);
            break;
    }
}

async function newSword(player, npc) {
    await npc.say(
        'Thanks for the offer',
        "I'd be surprised if you could though",
        'The thing is, this sword is a family heirloom'
    );

    await familyHeirloom(player, npc);
}

async function swordAbundance(player, npc) {
    await npc.say(
        'Yes you can get bronze swords anywhere',
        "But this isn't any old sword"
    );

    await familyHeirloom(player, npc);
}

async function isHeAngry(player, npc) {
    await npc.say(
        "He doesn't know yet",
        'I was hoping I could think of something to do',
        'Before he does find out',
        'But I find myself at a loss'
    );

    const choice = await player.ask(
        [
            'Well do you know the vague area you lost it?',
            'I can make a new sword if you like',
            'Well the kingdom is fairly abundant with swords',
            'Well I hope you find it soon'
        ],
        true
    );

    switch (choice) {
        case 0: // vague area
            await vagueArea(player, npc);
            break;
        case 1: // new sword
            await newSword(player, npc);
            break;
        case 2: // sword abundance
            await swordAbundance(player, npc);
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== SQUIRE_ID) {
        return false;
    }

    const questStage = player.questStages.theKnightsSword;

    player.engage(npc);

    if (!questStage) {
        await npc.say('Hello I am the squire to Sir Vyvin');

        const choice = await player.ask(
            [
                'And how is life as a squire?',
                "Wouldn't you prefer to be a squire for me?"
            ],
            true
        );

        switch (choice) {
            // how is life
            case 0: {
                await npc.say(
                    'Well Sir Vyvin is a good guy to work for',
                    "However I'm in a spot of trouble today",
                    "I've gone and lost Sir Vyvin's sword"
                );

                const choice = await player.ask(
                    [
                        'Do you know where you lost it?',
                        'I can make a new sword if you like',
                        'Is he angry?'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // vague area
                        await vagueArea(player, npc);
                        break;
                    case 1: // new sword
                        await newSword(player, npc);
                        break;
                    case 2: // angry
                        await isHeAngry(player, npc);
                        break;
                }
                break;
            }
            case 1: // squire for me
                await npc.say("No, sorry I'm loyal to Vyvin");
                break;
        }
    } else if (
        questStage === 1 ||
        questStage === 2 ||
        questStage === 3 ||
        (questStage === 4 && player.inventory.has(PORTRAIT_ID))
    ) {
        await npc.say('So how are you doing getting a sword?');
        await player.say("I'm still looking for Imcando dwarves");
    } else if (questStage === 4 && !player.inventory.has(PORTRAIT_ID)) {
        await npc.say('So how are you doing getting a sword?');

        await player.say(
            "I've found an Imcando dwarf",
            'But he needs a picture of the sword before he can make it'
        );

        await npc.say(
            'A picture eh?',
            'The only one I can think of is in a small portrait of Sir ' +
                "Vyvin's father",
            'Sir Vyvin keeps it in a cupboard in his room I think'
        );
    } else if (questStage === 5) {
        if (player.inventory.has(FALADIAN_KNIGHTS_SWORD_ID)) {
            const { world } = player;

            await player.say('I have retrieved your sword for you');

            await npc.say(
                'Thankyou, Thankyou',
                "I was seriously worried I'd have to own up to Sir Vyvin"
            );

            player.inventory.remove(FALADIAN_KNIGHTS_SWORD_ID);
            player.message('You give the sword to the squire');
            await world.sleepTicks(3);

            player.message(
                "Well done you have completed the knight's sword quest"
            );

            player.addExperience(
                'smithing',
                player.skills.smithing.base * 1500 + 1400,
                false
            );

            player.questStages.theKnightsSword = -1;
            player.addQuestPoints(1);
            player.message('@gre@You haved gained 1 quest point!');
        } else {
            await npc.say('So how are you doing getting a sword?');

            await player.say(
                "I've found a dwarf who will make the sword",
                "I've just got to find the materials for it now"
            );
        }
    } else if (questStage === -1) {
        await npc.say(
            'Hello friend',
            'thanks for your help before',
            'Vyvin never even realised it was a different sword'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
