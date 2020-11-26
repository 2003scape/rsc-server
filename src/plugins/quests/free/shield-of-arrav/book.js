// https://classic.runescape.wiki/w/Transcript:Book_(Shield_of_Arrav)

const BOOK_ID = 30;

const USE_OLD_REVISION = false;

const OLD_REVISION = [
    'The shield of Arrav',
    'by A.R.Wright',
    'Arrav is probably the best known hero of the 4th age.',
    'Amoung other achievements he was responsible for stopping the Orcish',
    'Invasion and defeating the three headed dragon of Jarn.',
    'There is however very little evidence of his actual existence.',
    'One surviving artifact from the 4th age is a faboulous shield.',
    'It has the image of a pegasus on it.',
    'This shield is believed to have once belonged to Arrav',
    'And is now indeed known as the shield of Arrav.',
    'For 150 years it was the prize piece in the royal museum of Varrock.',
    'However in the year 143 of the 5th age - approximately 20 years before',
    'The writing of this book a gang of thieves called the phoenix gang',
    'Broke into the museum and stole the shield.',
    'King Roald the VII put a 1200 gold reward on the return on the shield.',
    'However nobody mananged to retrieve it.',
    'The thieves who stole the shield have now become',
    'The most powerfull crime gang in Varrock.',
    "This shield is a part of Varrock's heritage and it is travesty",
    "That it is not in it's rightful place in the museum.",
    'The reward for the return of the shield still stands.'
];

const NEW_REVISION = [
    'The shield of Arrav',
    'By A.R.Wright',
    'Arrav is probably the best known hero of the 4th age.',
    'One surviving artifact from the 4th age is a fabulous shield.',
    'This shield is believed to have once belonged to Arrav',
    'And is now indeed known as the shield of Arrav.',
    'For 150 years it was the prize piece in the royal museum of Varrock.',
    'However in the year 143 of the 5th age',
    'A gang of thieves called the phoenix gang broke into the museum',
    'And stole the shield.',
    'King Roald the VII put a 1200 gold reward on the return on the shield.',
    'The thieves who stole the shield',
    'Have now become the most powerful crime gang in Varrock.',
    'The reward for the return of the shield still stands.'
];

const BOOK_MESSAGES = USE_OLD_REVISION ? OLD_REVISION : NEW_REVISION;

async function onInventoryCommand(player, item) {
    if (item.id !== BOOK_ID) {
        return false;
    }

    const { world } = player;

    for (const message of BOOK_MESSAGES) {
        player.message(`@que@${message}`);
        await world.sleepTicks(3);
    }

    return true;
}

module.exports = { onInventoryCommand };
