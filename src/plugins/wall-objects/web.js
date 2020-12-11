// https://classic.runescape.wiki/w/Web

const WEB_ID = 24;
const BLANK_ID = 16;

async function onUseWithWallObject(player, wallObject, item) {
    if (wallObject.id !== WEB_ID) {
        return false;
    }

    const isSharp = /knife|sword|dagger|scimitar|mace|axe/i.test(
        item.definition.name
    );

    if (!isSharp) {
        return false;
    }

    const { world } = player;

    player.message('@que@You try to destroy the web...');
    await world.sleepTicks(3);

    if (Math.random() >= 0.5) {
        player.message('@que@You slice through the web');

        const blank = world.replaceEntity('wallObjects', wallObject, BLANK_ID);

        world.setTimeout(() => {
            world.replaceEntity('wallObjects', blank, WEB_ID);
        }, 30000);
    } else {
        player.message('@que@You fail to cut through it');
    }

    return true;
}

module.exports = { onUseWithWallObject };
