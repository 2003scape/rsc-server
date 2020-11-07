async function sleepWord({ player }, { sleepWord }) {
    if (!player.interfaceOpen.sleep) {
        return;
    }

    const { world } = player;

    // request a new one
    if (sleepWord === '-null-') {
        if (Date.now() - player.lastSleepWord < 1000) {
            return;
        }

        player.openSleep(false);
    } else {
        if (player.sleepWord === sleepWord) {
            player.exitSleep(true);
        } else {
            player.sendSleepIncorrect();
            await world.sleepTicks(1);
            player.openSleep(false);
        }
    }
}

module.exports = { sleepWord };
