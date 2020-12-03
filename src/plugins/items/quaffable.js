// https://classic.runescape.wiki/w/Drinks

const BEER_GLASS_ID = 620;
const JUG_ID = 140;

const DRINK_EFFECTS = {
    // https://classic.runescape.wiki/w/Wine
    142: async (player, item) => {
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
    193: async (player, item) => {
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
    },

    // https://classic.runescape.wiki/w/Asgarnian_Ale
    267: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);
        player.message('@que@You drink the Ale');
        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(2);

        player.skills.attack.current = Math.max(
            0,
            player.skills.attack.current - 4
        );

        const maxStrength = player.skills.strength.base + 2;

        if (player.skills.strength.current < maxStrength) {
            player.skills.strength.current = maxStrength;
        }

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 2,
            player.skills.hits.base
        );

        player.sendStats();

        player.message(
            '@que@You feel slightly reinvigorated',
            '@que@And slightly dizzy too'
        );
    },

    // https://classic.runescape.wiki/w/Wizard%27s_Mind_Bomb
    268: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);
        player.message("@que@you drink the Wizard's Mind Bomb");
        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(2);

        for (const skillName of ['attack', 'strength', 'defense']) {
            player.skills[skillName].current = Math.min(
                0,
                player.skills[skillName].current - 2
            );
        }

        player.skills.magic.current =
            player.skills.magic.base +
            2 +
            (player.skills.magic.base >= 50 ? 1 : 0);

        player.sendStats();
        player.message('@que@You feel very strange');
    },

    // https://classic.runescape.wiki/w/Dwarven_Stout
    269: async (player, item) => {
        const { world } = player;

        player.sendBubble(item.id);

        player.message(
            '@que@You drink the Dwarven Stout',
            '@que@It tastes foul'
        );

        player.inventory.add(BEER_GLASS_ID);

        await world.sleepTicks(3);

        for (const skillName of ['attack', 'strength', 'defense']) {
            player.skills[skillName].current = Math.min(
                0,
                player.skills[skillName].current - 2
            );
        }

        player.skills.mining.current = player.skills.mining.base + 1;
        player.skills.smithing.current = player.skills.smithing.base + 1;

        player.skills.hits.current = Math.min(
            player.skills.hits.current + 1,
            player.skills.hits.base
        );

        player.sendStats();
        player.message('@que@It tastes pretty strong too');
    }
};

async function onInventoryCommand(player, item) {
    if (!DRINK_EFFECTS.hasOwnProperty(item.id)) {
        return false;
    }

    player.inventory.remove(item.id);
    await DRINK_EFFECTS[item.id](player, item);

    return true;
}

module.exports = { onInventoryCommand };
