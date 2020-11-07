async function onGameObjectCommandOne(player, gameObject) {
    if (!/sleep|rest|lie in/i.test(gameObject.definition.commands[0])) {
        return false;
    }

    player.displayFatigue = player.fatigue;
    player.openSleep(true);

    return true;
}

module.exports = { onGameObjectCommandOne };
