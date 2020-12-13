async function settingsGame({ player }, message) {
    delete message.type;
    Object.assign(player, message);
}

async function settingsPrivacy({ player }, message) {
    delete message.type;

    const oldBlockPrivate = player.blockPrivateChat;

    for (const setting of Object.keys(message)) {
        const property = `block${setting
            .slice(0, 1)
            .toUpperCase()}${setting.slice(1)}`;

        player[property] = message[setting];
    }

    if (player.blockPrivateChat === oldBlockPrivate) {
        return;
    }

    if (player.blockPrivateChat) {
        player.world.server.dataClient.playerWorldChange(player.username, 0);
    } else {
        player.world.server.dataClient.playerWorldChange(
            player.username,
            player.world.id
        );
    }
}

module.exports = { settingsGame, settingsPrivacy };
