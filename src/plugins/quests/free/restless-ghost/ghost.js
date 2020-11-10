// https://classic.runescape.wiki/w/Transcript:Ghost_(The_restless_ghost)

const GHOSTSPEAK_AMULET_ID = 24;
const GHOST_ID = 15;

async function dontSpeakGhost(player, npc) {
    await npc.say('Woo woo?');
    await player.say("Nope still don't understand you");
    await npc.say('Woooooooo');
    await player.say('Never mind');
}

async function goodbyeThanks(npc) {
    await npc.say('Wooo wooo');
}

async function goodbyeNotSure(player, npc) {
    const choice = await player.ask(
        ['Goodbye. Thanks for the chat', "Hmm I'm not sure about that"],
        true
    );

    switch (choice) {
        case 0: // goodbye
            await goodbyeThanks(npc);
            break;
        case 1: // not sure
            await npc.say('Wooo woo');
            await player.say('Well if you insist');
            await npc.say('Wooooooooo');
            await player.say('Ah well, better be off now');
            await npc.say('Woo');
            await player.say('Bye');
            break;
    }
}

async function interesting(player, npc) {
    await npc.say('Woo wooo', 'Woooooooooooooooooo');

    const choice = await player.ask(
        ['Did he really?', "Yeah that's what I thought"],
        true
    );

    switch (choice) {
        case 0: // did he
            await npc.say('Woo');

            const choice = await player.ask(
                [
                    'My brother had exactly the same problem',
                    'Goodbye. Thanks for the chat'
                ],
                true
            );

            switch (choice) {
                case 0: // brother
                    await npc.say('Woo Wooooo', 'Wooooo Woo woo woo');

                    const choice = await player.ask(
                        [
                            'Goodbye. Thanks for the chat',
                            "You'll have to give me the recipe some time"
                        ],
                        true
                    );

                    switch (choice) {
                        case 0: // goodbye
                            await goodbyeThanks(npc);
                            break;
                        case 1: // recipe
                            await npc.say('Wooooooo woo woooooooo');
                            await goodbyeNotSure(player, npc);
                    }

                    break;
                case 1: // goodbye
                    break;
            }

            break;
        case 1: // yeah
            await npc.say('Wooo woooooooooooooo');
            await goodbyeNotSure(player, npc);
            break;
    }
}

async function noAmulet(player, npc) {
    await player.say('Hello ghost, how are you?');
    await npc.say('Wooo wooo wooooo');

    const choice = await player.ask(
        [
            "Sorry I don't speak ghost",
            "Ooh that's interesting",
            'Any hints where I can find some treasure?'
        ],
        true
    );

    switch (choice) {
        case 0: // dont speak ghost
            await dontSpeakGhost(player, npc);
            break;
        case 1: // interesting
            await interesting(player, npc);
            break;
        case 2: // treasure
            await npc.say('Wooooooo woo!');

            const choice = await player.ask(
                [
                    "Sorry I don't speak ghost",
                    "Thank you. You've been very helpful"
                ],
                true
            );

            switch (choice) {
                case 0: // dont speak ghost
                    await dontSpeakGhost(player, npc);
                    break;
                case 1: // thanks
                    await npc.say('Wooooooo');
                    break;
            }

            break;
    }
}

async function onTalkToNPC(player, npc) {
    const questStage = player.questStages.theRestlessGhost;

    if (npc.id !== GHOST_ID || questStage === -1) {
        return false;
    }

    player.engage(npc);

    if (!player.inventory.isEquipped(GHOSTSPEAK_AMULET_ID)) {
        await noAmulet(player, npc);
    } else if (questStage === 1) {
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
