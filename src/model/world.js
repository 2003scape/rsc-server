const EntityList = require('./entity-list');
const Shop = require('./shop');
const bulk = require('bulk-require');
const flat = require('flat');
const fs = require('fs').promises;
const log = require('bole')('world');
const objects = require('@2003scape/rsc-data/config/objects');
const pluginDefaults = require('../plugins/defaults');
const tiles = require('@2003scape/rsc-data/config/tiles');
const wallObjects = require('@2003scape/rsc-data/config/wall-objects');
const { Landscape } = require('@2003scape/rsc-landscape');
const { PathFinder } = require('@2003scape/rsc-path-finder');

const entityLocations = {
    npcs: require('@2003scape/rsc-data/locations/npcs'),
    gameObjects: require('@2003scape/rsc-data/locations/objects'),
    wallObjects: require('@2003scape/rsc-data/locations/wall-objects'),
    groundItems: require('@2003scape/rsc-data/locations/items')
};

const entityConstructors = {
    npcs: require('./npc'),
    gameObjects: require('./game-object'),
    wallObjects: require('./wall-object'),
    groundItems: require('./ground-item')
};

// ms per each cycle of player/entity movement and delay updates
const TICK_INTERVAL = 640;

// ms between each global player save
const PLAYER_SAVE_INTERVAL = 1000 * 60 * 5; // (5 mins)

// when is a player's drop visible to other players?
const DROP_OWNER_TIMEOUT = 1000 * 60; // 1 min

// when does a drop disappear entirely?
const DROP_DISAPPEAR_TIMEOUT = 1000 * 60 * 2; // 2 mins

class World {
    constructor(server) {
        this.server = server;

        this.id = this.server.config.worldID;
        this.members = this.server.config.members;

        this.planeWidth = 2304;
        this.planeHeight = 1776;
        this.planeElevation = 944;

        // { pluginType: [function() {}, ...], ... }
        this.pluginDefaults = new Map(Object.entries(pluginDefaults));
        this.plugins = new Map();

        this.shops = new Map(); // { name: Shop }

        this.players = new EntityList(this.planeWidth, this.planeHeight);
        this.npcs = new EntityList(this.planeWidth, this.planeHeight);
        this.gameObjects = new EntityList(this.planeWidth, this.planeHeight);
        this.wallObjects = new EntityList(this.planeWidth, this.planeHeight);
        this.groundItems = new EntityList(this.planeWidth, this.planeHeight);

        this.tickIndex = 0;
        this.tickFunctions = new Map();

        // used to calculate average ms per tick
        this.deltaTickTimes = [];

        this.boundTick = this.tick.bind(this);
        this.boundSaveAllPlayers = this.saveAllPlayers.bind(this);
    }

    async loadLandscape() {
        const directory =
            `${__dirname}/../../node_modules/@2003scape/` +
            'rsc-data/landscape';

        this.landscape = new Landscape();

        this.landscape.loadJag(
            await fs.readFile(`${directory}/land63.jag`),
            await fs.readFile(`${directory}/maps63.jag`)
        );

        if (this.members) {
            this.landscape.loadMem(
                await fs.readFile(`${directory}/land63.mem`),
                await fs.readFile(`${directory}/maps63.mem`)
            );
        }

        this.landscape.parseArchives();

        this.pathFinder = new PathFinder(
            { objects, wallObjects, tiles },
            this.landscape
        );
    }

    addEntity(type, entity) {
        this[type].add(entity);

        if (type === 'gameObjects') {
            this.pathFinder.addObject(entity);
        } else if (type === 'wallObjects') {
            this.pathFinder.addWallObject(entity);
        }

        if (!this.players.length) {
            return;
        }

        for (const player of entity.getNearbyEntities('players')) {
            if (entity === player) {
                return;
            }

            player.localEntities.add(type, entity);
        }
    }

    removeEntity(type, entity) {
        this[type].remove(entity);

        if (type === 'players') {
            for (const npc of entity.localEntities.known.npcs) {
                npc.knownPlayers.delete(entity);
            }
        }

        if (entity.respawn) {
            this.setTimeout(() => {
                this.addEntity(
                    type,
                    new entityConstructors[type](this, entity)
                );
            }, entity.respawn);
        }

        for (const player of entity.getNearbyEntities('players')) {
            if (entity === player) {
                return;
            }

            if (player.localEntities.known[type].has(entity)) {
                player.localEntities.removed[type].add(entity);
            }
        }
    }

    loadEntities(type) {
        for (const entityLocation of entityLocations[type]) {
            const Entity = entityConstructors[type];
            const entity = new Entity(this, entityLocation);
            this.addEntity(type, entity);
        }

        log.info(`loaded ${this[type].length} ${type.slice(0, -1)} locations`);
    }

    loadShops() {
        for (const shopName of Shop.names) {
            this.shops.set(shopName, new Shop(this, shopName));
        }

        log.info(`loaded ${this.shops.size} shops`);
    }

    loadPlugins() {
        for (const [handlerName] of this.pluginDefaults) {
            this.plugins.set(handlerName, []);
        }

        let totalPlugins = 0;
        let pluginFiles = bulk(`${__dirname}/../plugins`, ['*.js', '**/*.js']);
        delete pluginFiles.default;
        pluginFiles = flat(pluginFiles);

        for (const pluginName of Object.keys(pluginFiles)) {
            const handler = pluginFiles[pluginName];

            if (
                typeof handler === 'function' &&
                this.pluginDefaults.has(handler.name)
            ) {
                const handlers = this.plugins.get(handler.name);
                handlers.push(handler);
                totalPlugins += 1;
            }
        }

        log.info(
            `loaded ${totalPlugins} plugin handlers from ` +
                `${Object.keys(pluginFiles).length} files`
        );
    }

    // load the definitions and locations required for the game
    async loadData() {
        await this.loadLandscape();

        for (const type of Object.keys(entityLocations)) {
            this.loadEntities(type);
        }

        this.loadShops();
        this.loadPlugins();
    }

    // add a new ground item owned by a certain player (temporarily)
    addPlayerDrop(player, item, x, y) {
        const groundItem = new entityConstructors.groundItems(this, {
            ...item,
            x: typeof x !== 'undefined' ? x : player.x,
            y: typeof y !== 'undefined' ? y : player.y
        });

        groundItem.owner = player.id;

        // if we never delete the owner property, it never shows up to other
        // players and still disappears after DROP_DISAPPEAR_TIMEOUT
        if (!groundItem.definition.untradeable) {
            this.setTimeout(() => {
                delete groundItem.owner;
            }, DROP_OWNER_TIMEOUT);
        }

        this.setTimeout(() => {
            this.removeEntity('groundItems', groundItem);
        }, DROP_DISAPPEAR_TIMEOUT);

        player.sendSound('dropobject');
        this.addEntity('groundItems', groundItem);
    }

    getPlayerByUsername(username) {
        username = username.toLowerCase();

        for (const player of this.players) {
            if (player.username === username) {
                return player;
            }
        }

        return null;
    }

    sendForeignPlayerLogin(username) {
        const player = this.getPlayerByUsername(username);

        if (player) {
            // do friend update
        }
    }

    sendForeignPlayerLogout(username) {
        for (const player of this.players) {
            for (const friend of Object.keys(player.friends)) {
                if (friend === username) {
                    player.sendFriendUpdate(friend, 0);
                }
            }
        }
    }

    // get a respawn time with { min, max } based on the player population.
    getRespawnTime(respawn) {
        if (!Number.isNaN(respawn)) {
            return respawn;
        }

        const delta = respawn.max - respawn.min;

        return Math.floor(
            respawn.min + delta * (1 - this.players.size / PLAYER_CAPACITY)
        );
    }

    // like setTimeout, but server cycles instead. still returns an ID you can
    // world.clearTickTimeout with
    setTickTimeout(func, ticks) {
        if (this.tickIndex >= Number.MAX_SAFE_INTEGER) {
            this.tickIndex = 0;
        }

        this.tickIndex += 1;
        this.tickFunctions.set(this.tickIndex, { func, ticks });

        return this.tickIndex;
    }

    // set tick timeout but just 1
    nextTick(func) {
        return this.setTickTimeout(func, 1);
    }

    clearTickTimeout(id) {
        this.tickFunctions.delete(id);
    }

    async sleepTicks(ticks) {
        return new Promise((resolve) => this.setTickTimeout(resolve, ticks));
    }

    // TODO test this out with sleepTicks approximation
    setTimeout(func, ms) {
        return setTimeout(func, ms);
    }

    clearTimeout(id) {
        clearTimeout(id);
    }

    sleep(ms) {
        return new Promise((resolve) => this.setTimeout(resolve, ms));
    }

    tick() {
        const startTime = Date.now();

        for (const [id, entry] of this.tickFunctions) {
            entry.ticks -= 1;

            if (entry.ticks === 0) {
                entry.func();
                this.tickFunctions.delete(id);
            }
        }

        for (const npc of this.npcs.getAll()) {
            npc.tick();
        }

        for (const player of this.players.getAll()) {
            player.tick();
        }

        const deltaTime = Date.now() - startTime;

        this.deltaTickTimes.push(deltaTime);

        if (this.deltaTickTimes.length === 100) {
            const averageTick = this.deltaTickTimes.reduce((sum, ms) => {
                return sum + ms;
            }, 0);

            log.info(
                `average tick time is: ~${(averageTick / 100).toFixed(2)}ms`
            );

            this.deltaTickTimes.length = 0;
        }

        setTimeout(this.boundTick, TICK_INTERVAL - deltaTime);
    }

    async saveAllPlayers() {
        if (!this.players.length) {
            return;
        }

        const startTime = Date.now();
        log.info('saving all players...');

        for (const player of this.players.getAll()) {
            await player.save();
        }

        const deltaTime = Date.now() - startTime;
        log.info(`finished saving all players in ${deltaTime}ms`);

        setTimeout(this.boundSaveAllPlayers, PLAYER_SAVE_INTERVAL);
    }

    toString() {
        return (
            `[World (id=${this.id}, members=${this.members}, players=` +
            `${this.players.length})]`
        );
    }
}

module.exports = World;
