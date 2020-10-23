async function appearance(socket, message) {
    const { player } = socket;
    player.unlock();
    player.interfaceOpen.appearance = false;

    player.setAppearance(message);
    player.broadcastPlayerAppearance();

    player.localEntities.characterUpdates.playerAppearances.push(
        player.formatAppearanceUpdate()
    );

    delete player.cache.sendAppearance;
}

module.exports = { appearance };
