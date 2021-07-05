// implements the same methods but shimmed to run in the browser

const log = require('bole')('browser-data-client');
const idbKeyval = require('idb-keyval');

const DEFAULT_PLAYER = {
    rank: 0,
    x: 122,
    y: 657,
    questPoints: 0,
    fatigue: 0,
    combatStyle: 0,
    blockChat: 0,
    blockPrivateChat: 0,
    blockTrade: 0,
    blockDuel: 0,
    cameraAuto: 0,
    oneMouseButton: 0,
    soundOn: 0,
    hairColour: 2,
    topColour: 8,
    trouserColour: 14,
    skinColour: 0,
    headSprite: 1,
    bodySprite: 2,
    skulled: 0,
    friends: [],
    ignores: [],
    inventory: [],
    bank: [],
    questStages: {},
    cache: {},
    muteEndDate: 0,
    id: 0,
    loginDate: 0,
    skills: {
        attack: { current: 1, experience: 0 },
        defense: { current: 1, experience: 0 },
        strength: { current: 1, experience: 0 },
        hits: { current: 10, experience: 4616 },
        ranged: { current: 1, experience: 0 },
        prayer: { current: 1, experience: 0 },
        magic: { current: 1, experience: 0 },
        cooking: { current: 1, experience: 0 },
        woodcutting: { current: 1, experience: 0 },
        fletching: { current: 1, experience: 0 },
        fishing: { current: 1, experience: 0 },
        firemaking: { current: 1, experience: 0 },
        crafting: { current: 1, experience: 0 },
        smithing: { current: 1, experience: 0 },
        mining: { current: 1, experience: 0 },
        herblaw: { current: 1, experience: 0 },
        agility: { current: 1, experience: 0 },
        thieving: { current: 1, experience: 0 }
    },
    loginIP: null,
    world: 0
};

class BrowserDataClient {
    constructor(server) {
        this.server = server;

        this.world = this.server.world;
        this.connected = true;

        // { playerID: username }
        this.playerUsernames = new Map();
    }

    async init() {
        await this.load();
    }

    async load() {
        const playerID = await idbKeyval.get('playerID');
        this.playerID = playerID ? Number(playerID) : 0;

        const players = await idbKeyval.get('players');

        this.players = players ? new Map(JSON.parse(players)) : new Map();

        for (const player of this.players.values()) {
            player.world = 0;
        }

        log.info(`loaded ${this.players.size} players from local storage`);
    }

    async save() {
        await idbKeyval.set('playerID', this.playerID);

        await idbKeyval.set(
            'players',
            JSON.stringify(Array.from(this.players.entries()))
        );
    }

    async savePlayer(player) {
        player.password = this.players.get(player.username).password;
        this.players.set(player.username, JSON.parse(JSON.stringify(player)));
        await this.save();
    }

    async sendAndReceive(message) {
        switch (message.handler) {
            case 'playerRegister': {
                message.username = message.username.toLowerCase();

                if (this.players.get(message.username)) {
                    return {
                        success: false,
                        code: 3
                    };
                }

                const player = JSON.parse(JSON.stringify(DEFAULT_PLAYER));

                player.id = this.playerID;
                player.username = message.username;
                player.password = message.password;

                this.playerID += 1;

                this.players.set(player.username, player);

                return {
                    success: true,
                    code: 2
                };
            }
            case 'playerLogin': {
                message.username = message.username.toLowerCase();

                const player = this.players.get(message.username);

                if (!player || player.password !== message.password) {
                    return {
                        success: false,
                        code: 3
                    };
                }

                if (player.world) {
                    return {
                        success: false,
                        code: 4
                    };
                }

                this.playerUsernames.set(player.id, player.username);

                player.world = 1;

                this.world.sendForeignPlayerWorld(
                    message.username,
                    player.world
                );

                return {
                    success: true,
                    code: 0,
                    player
                };
            }
            case 'playerUpdate': {
                delete message.handler;

                message.username = this.playerUsernames.get(message.id);
                message.loginDate = Date.now();

                await this.savePlayer(message);

                return { success: true };
            }
            case 'playerLogout': {
                delete message.handler;

                const player = this.players.get(message.username);

                player.world = 0;

                this.world.sendForeignPlayerWorld(
                    message.username,
                    player.world
                );

                return { success: true };
            }
            case 'playerGetWorlds': {
                const usernameWorlds = {};

                for (let username of message.usernames) {
                    username = username.toLowerCase();

                    const player = this.players.get(username);

                    if (player) {
                        usernameWorlds[username] = player.world;
                    } else {
                        usernameWorlds[username] = 0;
                    }
                }

                return { usernameWorlds };
            }
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

    async playerRegister({ username, password, ip }) {
        return this.sendAndReceive({
            handler: 'playerRegister',
            username,
            password,
            ip
        });
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
        this.sendAndReceive({ handler: 'playerLogout', username });
    }

    playerMessage(fromUsername, toUsername, message) {
        this.sendAndReceive({
            handler: 'playerMessage',
            fromUsername,
            toUsername,
            message
        });
    }
}

module.exports = BrowserDataClient;
