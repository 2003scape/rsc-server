async function onGameObjectCommandOne(player, gameObject) {
    const { world } = player;

    if (/go up|climb(-| )up/i.test(gameObject.definition.commands[0])) {
        player.teleport(
            player.x,
            player.y + world.planeElevation
        );

        return true;
    } else if (/climb(-| )down/i.test(gameObject.definition.commands[0])) {
        player.teleport(
            player.x,
            player.y - world.planeElevation
        );

        return true;
    }
}

module.exports = { onGameObjectCommandOne };
