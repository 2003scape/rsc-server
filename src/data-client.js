// communicate with https://github.com/2003scape/rsc-data-server

const JSONSocket = require('json-socket');
const log = require('bole')('data-client');
const net = require('net');
const uid = require('rand-token').uid;

const TIMEOUT = 10000;

class DataClient {
    constructor(server) {
        this.server = server;

        this.world = this.server.world;
        this.connected = false;

        this.socket = new JSONSocket(new net.Socket());

        this.socket.on('error', (err) => log.error(err));
        this.socket.on('message', (message) => this.handleMessage(message));

        this.socket.on('close', (hadError) => {
            this.socket._socket.removeAllListeners('ready');

            this.connected = false;
            log.error(`data-client closed. hadError: ${hadError}`);
            log.info('reconnecting in 5 seconds...');

            setTimeout(async () => {
                try {
                    await this.init();
                } catch (e) {
                    // pass
                }
            }, 5000);
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            const { config } = this.server;

            this.socket._socket.once('error', reject);

            this.socket._socket.once('ready', () => {
                this.socket._socket.removeListener('error', reject);
                resolve();
                this.connected = true;
                log.info('connected');
            });

            if (config.dataServerFile) {
                this.socket.connect(config.dataServerFile);
            } else {
                const [host, port] = config.dataServerTCP.split(':');
                this.socket.connect(+port, host);
            }
        });
    }

    async init() {
        await this.connect();
        await this.authenticate();
        await this.worldConnect();
    }

    end() {
        this.socket.end();
    }

    handleMessage(message) {
        log.debug('received message', message);

        switch (message.handler) {
            case 'playerLoggedIn':
            case 'playerWorldChange':
                this.world.sendForeignPlayerWorld(
                    message.username,
                    message.world
                );
                break;
            case 'playerLoggedOut':
                this.world.sendForeignPlayerWorld(message.username, 0);
                break;
            case 'playerMessage': {
                const player = this.world.getPlayerByUsername(
                    message.toUsername
                );

                if (
                    !player ||
                    player.blockPrivateChat ||
                    player.ignores.indexOf(message.fromUsername) > -1
                ) {
                    return;
                }

                player.receivePrivateMessage(
                    message.fromUsername,
                    message.message
                );

                break;
            }
        }
    }

    send(message) {
        if (!this.connected) {
            return;
        }

        const token = uid(64);
        message.token = token;

        log.debug('sending message', message);

        this.socket.sendMessage(message);
    }

    sendAndReceive(message) {
        if (!this.connected) {
            return;
        }

        const token = uid(64);
        message.token = token;

        log.debug('sending message', message);

        return new Promise((resolve) => {
            let onMessage, onError, messageTimeout;

            onMessage = (receivedMessage) => {
                if (receivedMessage.token !== token) {
                    return;
                }

                clearTimeout(messageTimeout);
                this.socket._socket.removeListener('message', onMessage);
                this.socket._socket.removeListener('error', onError);

                delete receivedMessage.token;
                receivedMessage.handler = message.handler;
                resolve(receivedMessage);
            };

            onError = () => {
                clearTimeout(messageTimeout);
                this.socket._socket.removeListener('message', onMessage);
                this.socket._socket.removeListener('error', onError);
            };

            this.socket.on('message', onMessage);
            this.socket.on('error', onError);

            messageTimeout = setTimeout(() => {
                this.socket._socket.removeListener('error', onError);
                this.socket._socket.removeListener('message', onMessage);
                log.error(
                    new Error(`timeout on response for ${message.handler}`)
                );
            }, TIMEOUT);

            this.socket.sendMessage(message);
        });
    }

    async authenticate() {
        const result = await this.sendAndReceive({
            handler: 'authenticate',
            password: this.server.config.dataServerPassword
        });

        if (!result.success) {
            log.error(result.error);
            throw new Error(result.error);
        }

        log.info('authenticated');
    }

    async worldConnect() {
        const { config } = this.server;

        const result = await this.sendAndReceive({
            handler: 'worldConnect',
            id: config.worldID,
            tcpPort: config.tcpPort,
            websocketPort: config.websocketPort,
            members: config.members,
            country: config.country
        });

        if (!result.success) {
            log.error(result.error);
            throw new Error(result.error);
        }

        log.info(`${this.world} connected`);
    }

    async playerLogin({ username, password, ip, reconnecting }) {
        return this.sendAndReceive({
            handler: 'playerLogin',
            username,
            password,
            ip,
            reconnecting
        });
    }

    playerLogout(username) {
        this.send({ handler: 'playerLogout', username });
    }

    playerWorldChange(username, worldID) {
        this.send({ handler: 'playerWorldChange', username, world: worldID });
    }

    async playerRegister({ username, password, ip }) {
        return this.sendAndReceive({
            handler: 'playerRegister',
            username,
            password,
            ip
        });
    }

    playerMessage(fromUsername, toUsername, message) {
        this.send({
            handler: 'playerMessage',
            fromUsername,
            toUsername,
            message
        });
    }
}

module.exports = DataClient;
