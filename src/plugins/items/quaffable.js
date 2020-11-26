// https://classic.runescape.wiki/w/Drinks

const BEER_GLASS_ID = 620;
const JUG_ID = 140;

const DRINK_EFFECTS = {
    // https://classic.runescape.wiki/w/Wine
    142: (player, item) => {
        player.sendBubble(item.id);

        player.skills.attack.current = Math.max(
            0,
            player.skills.attack.base - 3
        );

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 11,
            player.skills.hits.base
        );

        player.sendStats();

        player.inventory.add(JUG_ID);

        player.message('@que@You drink the wine');
        player.message('@que@It makes you feel a bit dizzy');
    },
    // https://classic.runescape.wiki/w/Beer
    193: (player, item) => {
        player.sendBubble(item.id);

        player.skills.attack.current = Math.max(
            0,
            Math.floor(player.skills.attack.current * 0.94) - 1
        );

        const maxStrength = Math.floor(player.skills.strength.base * 1.02) + 1;

        if (player.skills.strength.current < maxStrength) {
            player.skills.strength.current = maxStrength;
        }

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 1,
            player.skills.hits.base
        );

        player.sendStats();

        player.inventory.add(BEER_GLASS_ID);

        player.message('@que@You drink the beer');
        player.message('@que@You feel slightly reinvigorated');
        player.message('@que@And slightly dizzy too');
    }
};

async function onInventoryCommand(player, item) {
    if (!DRINK_EFFECTS.hasOwnProperty(item.id)) {
        return false;
    }

    player.inventory.remove(item.id);
    DRINK_EFFECTS[item.id](player, item);

    return true;
}

module.exports = { onInventoryCommand };
