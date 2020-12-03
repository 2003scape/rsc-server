// https://classic.runescape.wiki/w/Transcript:Miles

const items = require('@2003scape/rsc-data/config/items');

const {
    certificates: CERTIFICATE_IDS,
    certers
} = require('@2003scape/rsc-data/certificates');

// { certificateID: itemID }
const ITEM_IDS = {};

for (const [itemID, certificateID] of Object.entries(CERTIFICATE_IDS)) {
    ITEM_IDS[certificateID] = +itemID;
}

const CERTER_IDS = new Set(Object.keys(certers).map(Number));

// remove sidney smith since she's a special case
CERTER_IDS.delete(778);

function getCerter(id) {
    if (certers[id].reference) {
        return getCerter(certers[id].reference);
    }

    return certers[id];
}

async function tradeInCertificates(player, certer, itemTypeName) {
    player.message('what sort of certificate do you wish to trade in?');

    const certificateType = await player.ask(
        certer.certificates.map(({ id, alias }) => {
            return alias || items[id].name.replace(/ certificate/i, '');
        }),
        false
    );

    player.message('How many certificates do you wish to trade in?');

    const certificateAmount =
        1 + (await player.ask(['One', 'two', 'Three', 'four', 'five'], false));

    const certificateID = certer.certificates[certificateType].id;

    if (player.inventory.has(certificateID, certificateAmount)) {
        const itemID = ITEM_IDS[certificateID];

        player.inventory.remove(certificateID, certificateAmount);
        player.inventory.add(itemID, certificateAmount * 5);

        player.message(`You exchange your certificates for ${itemTypeName}`);
    } else {
        player.message("You don't have that many certificates");
    }
}

async function tradeInItems(player, certer, itemTypeName) {
    player.message(`what sort of ${itemTypeName} do you wish to trade in?`);

    const itemType = await player.ask(
        certer.items.map(({ id, alias }) => {
            return alias || items[id].name;
        }),
        false
    );

    // "fishs" is accurate
    player.message(`How many ${certer.type}s do you wish to trade in?`);

    const itemAmount =
        (1 +
            (await player.ask(
                ['five', 'ten', 'Fifteen', 'Twenty', 'Twentyfive'],
                false
            ))) *
        5;

    const itemID = certer.items[itemType].id;

    if (player.inventory.has(itemID, itemAmount)) {
        const certificateID = CERTIFICATE_IDS[itemID];

        player.inventory.remove(itemID, itemAmount);
        player.inventory.add(certificateID, Math.floor(itemAmount / 5));

        player.message(`You exchange your ${itemTypeName} for certificates`);
    } else {
        const amountName = /^(logs|bars)$/.test(certer.type) ? 'many' : 'much';

        player.message(`You don't have that ${amountName} ${certer.type}s`);
    }
}

async function onTalkToNPC(player, npc) {
    if (!CERTER_IDS.has(npc.id)) {
        return false;
    }

    const certer = getCerter(npc.id);
    const typePlural = certer.type !== 'fish' ? certer.type + 's' : certer.type;
    const itemTypeName = typePlural !== 'ores' ? typePlural : certer.type;

    player.engage(npc);

    await npc.say(`Welcome to my ${certer.type} exchange stall`);

    const choice = await player.ask(
        [
            'I have some certificates to trade in',
            `I have some ${typePlural} to trade in`,
            `What is a${certer.type === 'ore' ? 'n' : ''} ${certer.type} ` +
                'exchange stall?'
        ],
        true
    );

    switch (choice) {
        case 0: // certificates
            player.disengage();
            await tradeInCertificates(player, certer, itemTypeName);
            break;
        case 1: // items
            player.disengage();
            await tradeInItems(player, certer, itemTypeName);
            break;
        case 2: // what is a <type> stall?
            await npc.say(
                `You may exchange your ${typePlural} here`,
                'For certificates which are light and easy to carry',
                'You can carry many of these certificates at once unlike ' +
                    typePlural,
                `5 ${typePlural} will give you one certificate`,
                'You may also redeem these certificates here for ' +
                    `${typePlural} again`,
                'The advantage of doing this is',
                `You can trade large amounts of ${typePlural} with other ` +
                    'players quickly and safely'
            );

            player.disengage();
            break;
    }

    return true;
}

module.exports = { onTalkToNPC };
