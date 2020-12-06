// https://classic.runescape.wiki/w/Smithing#Forging

const items = require('@2003scape/rsc-data/config/items');
const { smithing } = require('@2003scape/rsc-data/skills/smithing');

const ANVIL_ID = 50;
const BRONZE_BAR_ID = 169;
const BRONZE_WIRE_ID = 979;
const DORICS_ANVIL_ID = 177;
const HAMMER_ID = 168;
const STEEL_BAR_ID = 171;
const STEEL_NAILS_ID = 419;

// for when you initially use the bar on the anvil
// { barID: minimumSmithingLevel }
const MINIMUM_LEVELS = {};

for (const [barID, { items }] of Object.entries(smithing.items)) {
    MINIMUM_LEVELS[+barID] = getMinimumLevel(items);
}

// these menus line up with the array structures in the JSON
const FORGING_MENUS = [
    {
        menu: 'Make Weapon',
        types: [
            'Dagger',
            'Throwing Knife',
            {
                menu: 'Sword',
                types: [
                    'Short Sword',
                    'Long Sword',
                    'Scimitar',
                    '2-handed Sword'
                ]
            },
            { menu: 'Axe', types: ['Hatchet', 'Battle Axe'] },
            'Mace'
        ]
    },
    {
        menu: 'Make Armour',
        types: [
            {
                menu: 'Helmet',
                types: ['Medium Helmet', 'Large Helmet']
            },
            {
                menu: 'Shield',
                types: ['Square Shield', 'Kite Shield']
            },
            {
                menu: 'Armour',
                types: [
                    'Chain Mail Body',
                    'Plate Mail Body',
                    'Plate Mail Legs',
                    'Plated Skirt'
                ]
            }
        ]
    },
    {
        menu: 'Make Missile Heads',
        types: ['Make Arrow Heads', 'Forge Dart Tips']
    }
];

const CRAFT_ITEM_MENU = {
    menu: 'Make Craft Item',
    types: ['Bronze Wire(1 bar)']
};

function getMinimumLevel(items) {
    items = items.flat(Infinity);

    return items.sort((a, b) => {
        if (a.level === b.level) {
            return 0;
        }

        return a.level > b.level ? 1 : -1;
    })[0].level;
}

async function promptForgeItem(player, menus, items, barID, depth = 0) {
    if (depth === 0) {
        if (barID === BRONZE_BAR_ID) {
            menus = menus.concat(CRAFT_ITEM_MENU);
        } else if (barID === STEEL_BAR_ID) {
            menus = menus.concat('Make Nails');
        }

        barID = smithing.bars;
    }

    const choices = menus.map((menu, i) => {
        const choice = typeof menu === 'string' ? menu : menu.menu;
        const barCount = barID[i];

        return choice + (barCount > 1 ? ` (${barCount} bars)` : '');
    });

    if (depth === 0) {
        choices.push('Cancel');
    }

    const choice = await player.ask(choices, false);

    if (depth === 0 && choice === choices.length) {
        return;
    }

    const { world } = player;

    // missile heads
    if (!world.members && choice === 2) {
        player.message('This feature is members only');
        return;
    }

    const type = choices[choice].toLowerCase().replace('make ', '');

    if (typeof menus[choice] !== 'string') {
        if (depth === 0) {
            player.message(`What sort of ${type} do you want to make?`);
        } else {
            player.message(`Choose a type of ${type} to make`);
        }

        return promptForgeItem(
            player,
            menus[choice].types,
            items[choice],
            barID[choice],
            depth + 1
        );
    } else {
        const item = items[choice];

        // generic item name used for smithing message
        let itemName = choices[choice]
            .toLowerCase()
            .replace(/ \((\d+) bars\)$/, '')
            .replace('hatchet', 'axe');

        if (!item.bars) {
            return { ...item, bars: barID[choice], itemName };
        } else {
            return { ...item, itemName };
        }
    }
}

async function onUseWithGameObject(player, gameObject, item) {
    if (
        gameObject.id === DORICS_ANVIL_ID &&
        player.questStages.doricsQuest !== -1
    ) {
        return false;
    }

    if (gameObject.id !== ANVIL_ID && gameObject.id !== DORICS_ANVIL_ID) {
        return false;
    }

    if (item.id === HAMMER_ID) {
        player.message(
            'To forge items use the metal you wish to work with the anvil'
        );

        return true;
    }

    if (!smithing.items.hasOwnProperty(item.id)) {
        return false;
    }

    const minimumLevel = MINIMUM_LEVELS[item.id];

    if (player.skills.smithing.current < minimumLevel) {
        const metalName = items[item.id].name.toLowerCase().replace(' bar', '');

        player.message(
            `You need at least level ${minimumLevel} smithing to work ` +
                `with ${metalName}`
        );

        return true;
    }

    if (!player.inventory.has(HAMMER_ID)) {
        player.message('@que@You need a hammer to work the metal with.');
        return true;
    }

    if (player.isTired()) {
        player.message('You are too tired to smith');
        return true;
    }

    player.message('What would you like to make?');

    const forgeItem = await promptForgeItem(
        player,
        FORGING_MENUS,
        smithing.items[item.id].items,
        item.id
    );

    // cancelled
    if (!forgeItem) {
        return true;
    }

    const { world } = player;
    const { level, id, amount, bars, itemName } = forgeItem;

    if (!world.members && id === BRONZE_WIRE_ID) {
        player.message('This feature is members only');
        return true;
    }

    if (player.skills.smithing.current < level) {
        player.message(
            `You need to be at least level ${level} smithing to do that`
        );

        return true;
    }

    if (!player.inventory.has(item.id, bars)) {
        player.message(`You need ${bars} bars of metal to make this item`);
        return true;
    }

    const experience = smithing.items[item.id].experience * bars;

    player.inventory.remove(item.id, bars);
    player.sendBubble(item.id);
    player.sendSound('anvil');
    player.inventory.add(id, amount);
    player.addExperience('smithing', experience);

    let determiner;

    if (amount > 1) {
        determiner = amount;
    } else {
        determiner = itemName === 'axe' ? 'an' : 'a';
    }

    if (id === BRONZE_WIRE_ID) {
        player.message(
            '@que@You hammer the Bronze Bar and make some bronze wire'
        );
    } else if (id === STEEL_NAILS_ID) {
        // some nails instead of 2 nails
        player.message('@que@You hammer the metal and make some nails');
    } else {
        player.message(
            `@que@You hammer the metal and make ${determiner} ${itemName}`
        );
    }

    return true;
}

module.exports = { onUseWithGameObject };
