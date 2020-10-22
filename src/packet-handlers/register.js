const log = require('bole')('register');

async function register(socket, message) {
    const { config, dataClient } = socket.server;
    const { version, username, password } = message;
    const ip = socket.getIPAddress();

    // only free-to-play worlds support registration
    if (socket.server.world.members) {
        socket.send(Buffer.from([15]));
        return;
    }

    if (version !== config.version) {
        socket.send(Buffer.from([5]));
        return;
    }

    const { code, success } = await dataClient.playerRegister({
        username,
        password,
        ip
    });

    if (success) {
        log.info(`${username} registered from ${ip}`);
    }

    socket.send(Buffer.from([code]));
}

module.exports = { register };
