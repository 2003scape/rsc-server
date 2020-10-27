async function appearance({ player }, message) {
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
