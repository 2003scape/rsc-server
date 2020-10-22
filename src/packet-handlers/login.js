const Player = require('../model/player');

// https://classic.runescape.wiki/w/Update:Latest_RuneScape_News_(19_March_2002)
// > This means RuneScape now has 8 worlds, a total capacity of
// > 10,000 simultaneous users
// 10000 / 8 = 1250
const MAX_PLAYERS = 1250;

function secureInt() {
    return (Math.random() * 0xffffffff) | 0;
}

async function session(socket) {
    if (!socket.server.dataClient.connected) {
        const failure = Buffer.alloc(8);
        socket.send(failure);
        process.nextTick(() => socket.close());
        return;
    }

    socket.isaacKeys = {
        in: [],
        out: [secureInt(), secureInt()]
    };

    const sessionID = Buffer.alloc(8);
    sessionID.writeInt32BE(socket.isaacKeys.out[0], 0);
    sessionID.writeInt32BE(socket.isaacKeys.out[1], 4);

    socket.send(sessionID);
}

async function login(socket, message) {
    const { dataClient, config, world } = socket.server;
    const { reconnecting, version, username, password } = message;

    if (version !== config.version) {
        socket.send(Buffer.from([5]));
        process.nextTick(() => socket.close());
        return;
    }

    if (username.length < 3 || password.length < 5) {
        socket.send(Buffer.from([3]));
        process.nextTick(() => socket.close());
        return;
    }

    if (world.players.length >= MAX_PLAYERS) {
        socket.send(Buffer.from([14]));
        process.nextTick(() => socket.close());
    }

    const { code, success, player } = await dataClient.playerLogin({
        username,
        password,
        ip: socket.getIPAddress(),
        reconnecting
    });

    socket.send(Buffer.from([code]));

    process.nextTick(() => {
        if (!success) {
            socket.close();
            return;
        }

        socket.player = new Player(world, socket, player);
        socket.player.login(reconnecting);
    });
}

module.exports = { session, login };
