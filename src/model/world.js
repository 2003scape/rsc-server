const Captcha = require('@2003scape/rsc-captcha');
const EntityList = require('./entity-list');
const Shop = require('./shop');
const flat = require('flat');
const fs = require('fs');
const log = require('bole')('world');
const objects = require('@2003scape/rsc-data/config/objects');
const pluginFiles = require('../plugins');
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

// function names that can be used in files within the ../plugins/ directory
// that will potentially block default behaviour
const PLUGIN_TYPES = [
    'onTalkToNPC',
    'onGameObjectCommandOne',
    'onGameObjectCommandTwo',
    'onWallObjectCommandOne',
    'onWallObjectCommandTwo',
    'onGroundItemTake',
    'onUseWithGroundItem',
    'onUseWithGameObject',
    'onUseWithWallObject',
    'onUseWithInventory',
    'onUseWithNPC',
    'onUseWithPlayer',
    'onInventoryCommand',
    'onDropItem',
    'onNPCAttack',
    'onNPCDeath'
];

// prevent spawning entities outside of the f2p boundaries
const FREE_BOUNDS = {
    minX: 48,
    maxX: 450,
    minY: 128,
    maxY: 766
};

class World {
    constructor(server) {
        this.server = server;

        this.id = this.server.config.worldID;
        this.members = this.server.config.members;

        this.planeWidth = 2304;
        this.planeHeight = 1776;
        this.planeElevation = 944;

        this.playerCapacity = 1250;

        // { pluginType: [function() {}, ...], ... }
        this.plugins = new Map();

        this.shops = new Map(); // { name: Shop }

        const totalHeight = this.planeHeight * 4;

        this.players = new EntityList(this.planeWidth, totalHeight);
        this.npcs = new EntityList(this.planeWidth, totalHeight);
        this.gameObjects = new EntityList(this.planeWidth, totalHeight);
        this.wallObjects = new EntityList(this.planeWidth, totalHeight);
        this.groundItems = new EntityList(this.planeWidth, totalHeight);

        this.captcha = new Captcha();

        // used for clearTickTimeout
        this.tickIndex = 0;

        // { tickIndex: function() {} }
        this.tickFunctions = new Map();

        // used to calculate average ms per tick (every 100 ticks)
        this.deltaTickTimes = [];

        this.boundTick = this.tick.bind(this);
        this.boundSaveAllPlayers = this.saveAllPlayers.bind(this);

        this.ticks = 0;
    }

    loadLandscape() {
        this.landscape = new Landscape();

        this.landscape.loadJag(
            fs.readFileSync(
                __dirname +
                    '/../../node_modules/@2003scape/rsc-data/landscape/land63.jag'
            ),
            fs.readFileSync(
                __dirname +
                    '/../../node_modules/@2003scape/rsc-data/landscape/maps63.jag'
            )
        );

        if (this.members) {
            this.landscape.loadMem(
                fs.readFileSync(
                    __dirname +
                        '/../../node_modules/@2003scape/rsc-data/landscape/land63.mem'
                ),
                fs.readFileSync(
                    __dirname +
                        '/../../node_modules/@2003scape/rsc-data/landscape/maps63.mem'
                )
            );
        }

        this.landscape.parseArchives();

        this.pathFinder = new PathFinder(
            { objects, wallObjects, tiles },
            this.landscape
        );
    }

    addEntity(type, entity) {
        if (type === 'gameObjects') {
            this.pathFinder.addObject(entity);
        } else if (type === 'wallObjects') {
            // always overwrite wallobjects
            const exisiting = this.wallObjects.getAtPoint(entity.x, entity.y);

            for (const wallObject of exisiting) {
                this.wallObjects.remove(wallObject);
            }

            try {
                const tile = this.landscape.getTileAtGameCoords(
                    entity.x,
                    entity.y
                );

                if (entity.direction === 0) {
                    tile.wall.horizontal = entity.id + 1;
                } else if (entity.direction === 1) {
                    tile.wall.vertical = entity.id + 1;
                } else if (tile.wall) {
                    if (!tile.wall.diagonal) {
                        tile.wall.diagonal = {};
                    }

                    tile.wall.diagonal.overlay = entity.id + 1;
                }
            } catch (e) {
                // pass
            }

            this.pathFinder.addWallObject(entity);
        }

        this[type].add(entity);

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
        if (!this[type].remove(entity)) {
            throw new Error(`unable to remove entity ${entity}`);
        }

        if (type === 'players') {
            for (const npc of entity.localEntities.known.npcs) {
                npc.knownPlayers.delete(entity);
            }
        }

        if (entity.respawn) {
            this.setTimeout(() => {
                entity.x = entity.spawnX || entity.x;
                entity.y = entity.spawnY || entity.y;

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

    replaceEntity(type, entity, newID) {
        const Entity = entityConstructors[type];
        const newEntity = new Entity(this, { ...entity, id: newID });
        this.removeEntity(type, entity);
        this.addEntity(type, newEntity);

        return newEntity;
    }

    loadEntities(type) {
        for (const entityLocation of entityLocations[type]) {
            const Entity = entityConstructors[type];
            const entity = new Entity(this, entityLocation);

            // prevents doogle leaves and such showing up in free-to-play
            if (!this.members && entity.definition.members) {
                continue;
            }

            const flatY = entity.y % this.planeElevation;

            if (
                !this.members &&
                (entity.x > FREE_BOUNDS.maxX ||
                    entity.x < FREE_BOUNDS.minX ||
                    flatY > FREE_BOUNDS.maxY ||
                    flatY < FREE_BOUNDS.minY)
            ) {
                continue;
            }

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
        for (const handlerName of PLUGIN_TYPES) {
            this.plugins.set(handlerName, []);
        }

        let totalPlugins = 0;

        const pluginHandlers = flat(pluginFiles);

        for (const pluginName of Object.keys(pluginHandlers)) {
            const handler = pluginHandlers[pluginName];

            if (
                typeof handler === 'function' &&
                this.plugins.has(handler.name)
            ) {
                const handlers = this.plugins.get(handler.name);
                handlers.push(handler);
                totalPlugins += 1;
            }
        }

        log.info(`loaded ${totalPlugins} plugin handlers`);
    }

    // load the definitions and locations required for the game
    async loadData() {
        this.loadLandscape();

        for (const type of Object.keys(entityLocations)) {
            this.loadEntities(type);
        }

        this.loadShops();
        this.loadPlugins();

        if (
            !process.browser ||
            (process.browser && typeof OffscreenCanvas !== 'undefined')
        ) {
            await this.captcha.loadFonts();
        } else {
            log.warn(
                'captcha disabled as OffscreenCanvas was not found. enable ' +
                    'in about:config on firefox'
            );
        }
    }

    async callPlugin(handlerName, ...args) {
        for (const handler of this.plugins.get(handlerName)) {
            try {
                const blocked = await handler.apply(this, args);

                if (blocked) {
                    return true;
                }
            } catch (e) {
                if (handlerName === 'onTalkToNPC') {
                    args[0].disengage();

                    if (e.message !== 'interrupted ask') {
                        log.error(e);
                    }

                    return true;
                } else if (e.message === 'interrupted ask') {
                    args[0].unlock();
                    return true;
                }

                log.error(e);
                return true;
            }
        }

        return false;
    }

    // add a new ground item owned by a certain player (temporarily)
    addPlayerDrop(player, item, x, y) {
        if (typeof item === 'number') {
            item = { id: item };
        }

        const groundItem = new entityConstructors.groundItems(this, {
            ...item,
            x: typeof x !== 'undefined' ? x : player.x,
            y: typeof y !== 'undefined' ? y : player.y
        });

        groundItem.owner = player.id;

        // if we never delete the owner property, it never shows up to other
        // players and still disappears after DROP_DISAPPEAR_TIMEOUT
        if (
            !groundItem.definition.untradeable &&
            (!this.members ? !groundItem.definition.members : true)
        ) {
            this.setTimeout(() => delete groundItem.owner, DROP_OWNER_TIMEOUT);
        }

        this.setTimeout(() => {
            this.removeEntity('groundItems', groundItem);
        }, DROP_DISAPPEAR_TIMEOUT);

        this.addEntity('groundItems', groundItem);
    }

    getPlayerByUsername(username) {
        username = username.toLowerCase();

        for (const player of this.players.getAll()) {
            if (player.username === username) {
                return player;
            }
        }
    }

    sendForeignPlayerWorld(username, worldID) {
        for (const player of this.players.getAll()) {
            if (player.friends.indexOf(username) > -1) {
                player.sendFriendWorld(username, worldID);
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
            respawn.min + delta * (1 - this.players.size / this.playerCapacity)
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
        this.ticks += 1;

        const startTime = Date.now();

        this.server.readMessages();

        try {
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

            for (const player of this.players.getAll()) {
                player.localEntities.sendRegions();
            }
        } catch (e) {
            log.error(e);
        }

        this.server.sendMessages();

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
