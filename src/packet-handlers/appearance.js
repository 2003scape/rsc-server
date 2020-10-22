async function appearance(socket, message) {
    const { player } = socket;
    player.unlock();
    player.interfaceOpen.appearance = false;

    player.setAppearance(message);
    player.updatePlayerAppearance(player);

    delete player.cache.sendAppearance;
}

module.exports = { appearance };
