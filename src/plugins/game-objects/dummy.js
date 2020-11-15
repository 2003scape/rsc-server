// https://classic.runescape.wiki/w/Dummy

const DUMMY_ID = 49;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== DUMMY_ID) {
        return false;
    }

    const { world } = player;

    player.message('@que@You swing at the dummy');
    await world.sleepTicks(4);

    player.message('@que@You hit the dummy');

    if (player.skills.attack.current > 7) {
        player.message(
            '@que@There is nothing more you can learn from hitting this dummy'
        );
    } else {
        player.addExperience('attack', 20);
    }

    return true;
}

module.exports = onGameObjectCommandOne;
