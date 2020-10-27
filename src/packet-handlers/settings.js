async function settingsGame({ player }, message) {
    delete message.type;
    Object.assign(player, message);
}

async function settingsPrivacy({ player }, message) {
    delete message.type;

    for (const setting of Object.keys(message)) {
        const property =
            `block${setting.slice(0,1).toUpperCase()}${setting.slice(1)}`;
        player[property] = message[setting];
    }
}

module.exports = { settingsGame, settingsPrivacy };
