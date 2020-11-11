// https://classic.runescape.wiki/w/Transcript:Man

// handle the darker-skinned men and farmers
const MAN_IDS = new Set([11, 63, 72]);

async function killingCitizens(npc) {
    await npc.say(
        "I'm a little worried",
        "I've heard there's lots of people going about",
        'killing citizens at random'
    );
}

async function worriedAboutGoblins(player, npc) {
    await npc.say(
        'Not too bad',
        "I'm a little worried about the increase in Goblins these days"
    );

    await player.say("Don't worry. I'll kill them");
}

async function wishToTrade(player, npc) {
    await player.say('Do you wish to trade?');

    await npc.say(
        'No, I have nothing I wish to get rid of',
        'If you want to do some trading,',
        'there are plenty of shops and market stalls around though'
    );
}

async function searchOfQuest(player, npc) {
    await player.say("I'm in search of a quest");
    await npc.say("I'm sorry I can't help you there");
}

async function enemiesToKill(player, npc) {
    await player.say("I'm in search of enemies to kill");

    await npc.say(
        "I've heard there are many fearsome creatures under the ground"
    );
}

async function howCanIHelp(player, npc) {
    await npc.say('How can I help you?');

    const choice = await player.ask([
        'Do you wish to trade?',
        "I'm in search of a quest",
        "I'm in search of enemies to kill"
    ]);

    switch (choice) {
        case 0: // trade
            await wishToTrade(player, npc);
            break;
        case 1: // quest
            await searchOfQuest(player, npc);
            break;
        case 2: // enemies
            await enemiesToKill(player, npc);
            break;
    }
}

async function inAHurry(npc) {
    await npc.say('Get out of my way', "I'm in a hurry");
}

async function imFine(player, npc) {
    await npc.say("I'm fine", 'How are you?');
    await player.say('Very well, thank you');
}

async function askingForFight(player, npc) {
    await npc.say('Are you asking for a fight?');
    player.disengage();
    await npc.attack(player);
}

async function niceWeather(npc) {
    await npc.say('Hello', "Nice weather we've been having");
}

async function onTalkToNPC(player, npc) {
    if (!MAN_IDS.has(npc.id)) {
        return false;
    }

    player.engage(npc);

    await player.say('Hello', "How's it going?");

    const roll = Math.floor(Math.random() * 14);

    switch (roll) {
        case 0:
            await killingCitizens(npc);
            break;
        case 1:
            await worriedAboutGoblins(player, npc);
            break;
        case 2:
            await howCanIHelp(player, npc);
            break;
        case 3:
            await npc.say('How can I help you?');
            await wishToTrade(player, npc);
            break;
        case 4:
            await npc.say('How can I help you?');
            await searchOfQuest(player, npc);
            break;
        case 5:
            await npc.say('How can I help you?');
            await enemiesToKill(player, npc);
            break;
        case 6:
            await npc.say('Not too bad');
            break;
        case 7:
            player.message('The man ignores you');
            break;
        case 8:
            await npc.say('None of your business');
            break;
        case 9:
            await inAHurry(npc);
            break;
        case 10:
            await imFine(player, npc);
            break;
        case 11:
            await askingForFight(player, npc);
            break;
        case 12:
            await npc.say('Hello');
            break;
        case 13:
            await niceWeather(npc);
            break;
    }

    player.disengage();

    return true;
}

module.exports = {
    killingCitizens,
    worriedAboutGoblins,
    searchOfQuest,
    howCanIHelp,
    inAHurry,
    imFine,
    askingForFight,
    niceWeather,
    onTalkToNPC
};
