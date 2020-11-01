function climb(player, gameObject, up) {
    const { world } = player;

    const direction = player.direction;
    const height = gameObject.definition.height;

    if (height > 1) {
        let xOffset = 0;
        let yOffset = 0;

        switch (gameObject.direction) {
            case 0:
                yOffset = up ? -height : 1;
                break;
            case 2:
                xOffset = up ? -height : 1;
                break;
            case 4:
                yOffset = up ? -1 : height;
                break;
            case 6:
                xOffset = up ? -1 : height;
                break;
        }

        player.teleport(
            gameObject.x + xOffset,
            gameObject.y + (world.planeElevation * (up ? 1 : -1)) + yOffset
        );
    } else {
        player.teleport(
            player.x,
            player.y + (world.planeElevation * (up ? 1 : -1))
        );
    }

    player.direction = direction;
}

async function onGameObjectCommandOne(player, gameObject) {
    const { world } = player;

    if (/go up|climb(-| )up/i.test(gameObject.definition.commands[0])) {
        await world.sleepTicks(1);
        climb(player, gameObject, true);
        return true;
    } else if (
        /go down|climb(-| )down/i.test(gameObject.definition.commands[0])
    ) {
        await world.sleepTicks(1);
        climb(player, gameObject, false);
        return true;
    }

    return false;
}

module.exports = { onGameObjectCommandOne };
