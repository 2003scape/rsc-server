// implements the same methods but stubbed to run in the browser

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
        attack: { current: 0, experience: 0 },
        defense: { current: 0, experience: 0 },
        strength: { current: 0, experience: 0 },
        hits: { current: 0, experience: 4616 },
        ranged: { current: 0, experience: 0 },
        prayer: { current: 0, experience: 0 },
        magic: { current: 0, experience: 0 },
        cooking: { current: 0, experience: 0 },
        woodcutting: { current: 0, experience: 0 },
        fletching: { current: 0, experience: 0 },
        fishing: { current: 0, experience: 0 },
        firemaking: { current: 0, experience: 0 },
        crafting: { current: 0, experience: 0 },
        smithing: { current: 0, experience: 0 },
        mining: { current: 0, experience: 0 },
        herblaw: { current: 0, experience: 0 },
        agility: { current: 0, experience: 0 },
        thieving: { current: 0, experience: 0 }
    },
    loginIP: null
};

class BrowserDataClient {
    constructor() {
        this.connected = true;
    }

    async init() {
        await this.load();
    }

    async load() {
        const playerID = await idbKeyval.get('playerID');
        this.playerID = playerID ? Number(playerID) : 0;

        const players = await idbKeyval.get('players');

        this.players = players ? new Map(JSON.parse(players)) : new Map();

        log.info(`loaded ${this.players.size} players from local storage`);
    }

    async save() {
        await idbKeyval.set('playerID', this.playerID);

        await idbKeyval.set(
            'players',
            JSON.stringify(Object.entries(this.players))
        );
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

                return {
                    success: true,
                    code: 0,
                    player: player
                };
            }
            case 'playerUpdate': {
                console.log('hi');
            }
            case 'playerLogout': {
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
        this.send({ handler: 'playerLogout', username });
    }
}

module.exports = BrowserDataClient;
