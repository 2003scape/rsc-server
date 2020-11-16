// https://classic.runescape.wiki/w/Thrander
// https://classic.runescape.wiki/w/Transcript:Thrander

const Item = require('../../../model/item');

const THRANDER_ID = 160;

// { fromItemID: toItemID }
const CONVERSION_IDS = {
    // bronze plate mail -> plate top
    117: 308,
    // iron plate mail -> plate top
    8: 312,
    // steel plate mail -> plate top
    118: 309,
    // black plate mail -> plate top
    196: 313,
    // mithril plate mail -> plate top
    119: 310,
    // adamantite plate mail -> plate top
    120: 311,
    // rune plate mail -> plate top
    401: 407,
    // bronze plate legs -> skirt
    206: 214,
    // iron plate legs -> skirt
    9: 215,
    // steel plate legs -> skirt
    121: 225,
    // black plate legs -> skirt
    248: 434,
    // mithril plate legs -> skirt
    122: 226,
    // adamantite plate legs -> skirt
    123: 227,
    // rune plate legs -> skirt
    402: 406
};

for (const [from, to] of Object.entries(CONVERSION_IDS)) {
    CONVERSION_IDS[to] = +from;
}

function getFormattedName(item, isConverted = false) {
    const name = item.definition.name;
    const isSkirt = /skirt$/i.test(name);
    const isLegs = /legs$/i.test(name);
    const isTop = /top$/i.test(name);
    const isBody = /body$/i.test(name);
    const split = name.split(' ');

    let metalType = split.shift();

    // TODO confirm with Luis if this is the correct capitalization
    if (
        metalType === 'Black' ||
        metalType === 'Rune' ||
        (isLegs && metalType !== 'Iron') ||
        (isSkirt && metalType !== 'Iron') ||
        (metalType === 'Iron' &&
            ((!isConverted && isSkirt) || (isConverted && isLegs))) ||
        ((isTop || isBody) && isConverted && metalType === 'Bronze') ||
        (metalType === 'Adamantite' &&
            ((!isConverted && isBody) || (isConverted && isTop)))
    ) {
        metalType = metalType.toLowerCase();
    }

    let determiner = isLegs ? 'some' : 'a';

    return `${determiner} ${metalType} ${split.join(' ').toLowerCase()}`;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== THRANDER_ID) {
        return false;
    }

    player.engage(npc);

    await npc.say(
        "Hello I'm Thrander the smith",
        "I'm an expert in armour modification",
        'Give me your armour designed for men',
        'And I can convert it into something more comfortable for a women',
        'And visa versa'
    );

    player.disengage(npc);
    return true;
}

async function onUseWithNPC(player, npc, item) {
    if (npc.id !== THRANDER_ID || !CONVERSION_IDS.hasOwnProperty(item.id)) {
        return false;
    }

    player.engage(npc);

    const { world } = player;

    player.inventory.remove(item.id);
    player.message(`You give Thrander ${getFormattedName(item, false)}`);
    await world.sleepTicks(3);

    player.message('Thrander hammers it for a bit');
    await world.sleepTicks(3);

    const converted = new Item({ id: CONVERSION_IDS[item.id] });
    player.inventory.add(converted);
    player.message(`Thrander gives you ${getFormattedName(converted, true)}`);

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC, onUseWithNPC };
