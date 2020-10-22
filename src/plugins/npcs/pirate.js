// https://classic.runescape.wiki/w/Transcript:Pirate

const PIRATE_IDS = new Set([137, 264]);

const DIALOGUE_LINES = [
    "I'm the scourge of the seven seas",
    'Arrh, I be in search of buried treasure',
    'Arrrh ye lily livered landlubber',
    'Ahoy there',
    'Arrh',
    'Yo ho ho me hearties',
    'Splice the mainbrace',
    'Avast me hearties',
    "Arrh I'll keel haul ye",
    'shiver me timbers',
    'Arrh be off with ye',
    'Yo ho ho and bottle of alchopop',
    'Arrh ye scury sea dog',
    "Batton down the hatches there's a storm a brewin",
    'A pox on ye',
    'Yo ho ho and a bottle of a rum',
    '3 days at port for resupply then out on the high sea',
    'Keel haul them I say',
    'Avast behind',
    'Good day to you my dear sir',
    "Great blackbeard's beard",
    'Arrh arrh',
    'Man overboard'
];

async function onTalkToNPC(player, npc) {
    if (!PIRATE_IDS.has(npc.id)) {
        return false;
    }

    player.engange(npc);

    const roll = Math.floor(Math.random() * (DIALOGUE_LINES.length + 2));

    if (roll === DIALOGUE_LINES.length) {
        await npc.say("I think ye'll be taking a long walk off a short plank");
        npc.attack(player);
    } else if (roll === DIALOGUE_LINES.length + 1) {
        await npc.say('avast behind');
        await player.say("I'm not that fat");
    } else {
        await npc.say(DIALOGUE_LINES[roll]);
    }

    player.disengage();

    return true;
}

module.exports = { onTalkToNPC };
