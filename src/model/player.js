const Bank = require('./bank');
const Captcha = require('@2003scape/rsc-captcha');
const Character = require('./character');
const Inventory = require('./inventory');
const LocalEntities = require('./local-entities');
const Trade = require('./trade');
const log = require('bole')('player');
const prayers = require('@2003scape/rsc-data/config/prayers');
const quests = require('@2003scape/rsc-data/quests');
const regions = require('@2003scape/rsc-data/regions');
const { formatSkillName, experienceToLevel } = require('../skills');

const {
    rollPlayerNPCDamage,
    rollPlayerPlayerDamage,
    rollPlayerNPCRangedDamage
} = require('../combat');

const { weapons: rangedWeapons } = require('@2003scape/rsc-data/ranged');

// properties to save in the database
const SAVE_PROPERTIES = [
    'id',
    'rank',
    'x',
    'y',
    'questPoints',
    'combatStyle',
    'fatigue',
    'cameraAuto',
    'oneMouseButton',
    'soundOn',
    'blockChat',
    'blockPrivateChat',
    'blockTrade',
    'blockDuel',
    'skulled',
    'skills',
    'friends',
    'ignores',
    'questStages',
    'cache',
    'inventory',
    'bank',
    'muteEndDate'
];

// amounts fatigue goes down by with sleeping bags or beds
const SLEEP_BAG_RATE = 4125;
const SLEEP_BED_RATE = 16500;
const MAX_FATIGUE = 75000;

// how many ticks to wait before re-generating health
const RESTORE_TICKS = 100;

const RAPID_RESTORE_ID = 6;
const RAPID_HEAL_ID = 7;

class Player extends Character {
    constructor(world, socket, playerData) {
        super(world);

        this.socket = socket;

        this.username = playerData.username;
        this.lastIP = playerData.loginIP;
        this.loginDate = playerData.loginDate;
        this.muteEndDate = playerData.muteEndDate;

        // database ID
        this.id = playerData.id;

        // moderator or administrator?
        this.rank = playerData.rank;

        this.x = playerData.x;
        this.y = playerData.y;
        this.questPoints = playerData.questPoints;

        // real RSC didn't save this
        if (this.world.server.config.rememberCombatStyle) {
            this.combatStyle = playerData.combatStyle;
        } else {
            this.combatStyle = 0;
        }

        // 0 - 75000
        this.fatigue = playerData.fatigue;

        // game settings
        this.cameraAuto = playerData.cameraAuto;
        this.oneMouseButton = playerData.oneMouseButton;
        this.soundOn = playerData.soundOn;

        // privacy settings
        this.blockChat = playerData.blockChat;
        this.blockPrivateChat = playerData.blockPrivateChat;
        this.blockTrade = playerData.blockTrade;
        this.blockDuel = playerData.blockDuel;

        // ticks remaining until unskulled
        this.skulled = playerData.skulled;

        this.friends = playerData.friends;
        this.ignores = playerData.ignores;
        this.questStages = playerData.questStages;
        this.cache = playerData.cache;

        this.skills = playerData.skills;

        for (const skillName of Object.keys(this.skills)) {
            this.skills[skillName].base = experienceToLevel(
                this.skills[skillName].experience
            );
        }

        this.combatLevel = this.getCombatLevel();

        this.inventory = new Inventory(this, playerData.inventory);

        this.equipmentBonuses = {};
        this.inventory.updateEquipmentBonuses();

        this.bank = new Bank(this, playerData.bank);

        this.prayers = [];
        this.prayers.length = prayers.length;
        this.prayers.fill(false);

        // https://oldschool.runescape.wiki/w/Prayer#Prayer_drain_resistance
        this.prayerDrainCounter = 0;

        this.interfaceOpen = {
            bank: false,
            shop: false,
            sleep: false,
            appearance: false,
            trade: false
        };

        // current shop open the player has open, if any
        this.shop = null;

        // trade object to manage trading
        this.trade = new Trade(this);

        // incremented every time we change appearance
        this.appearanceIndex = 0;

        this.setAppearance(playerData);
        this.inventory.updateEquipmentSlots();

        this.localEntities = new LocalEntities(this);

        // list of { deltaX, deltaY } steps we're going to move to each tick
        this.walkQueue = [];

        // action to perform when path is done
        this.endWalkFunction = null;

        // Date.now() of last chat to prevent chat spam
        this.lastChat = 0;

        // Date.now() of last sleep word request
        this.lastSleepWord = 0;

        // how many ticks left until we re-generate skills (restoreTicks is
        // everything besides prayer and hits)
        this.healTicks = RESTORE_TICKS;
        this.restoreTicks = RESTORE_TICKS;
        this.debuffTicks = RESTORE_TICKS;

        this.loggedIn = false;

        this.isWalking = false;
        this.endWalkLocked = false;
    }

    // send a packet if the socket is connected
    send(message) {
        if (!this.socket) {
            return;
        }

        this.world.server.outgoingMessages.push({
            socket: this.socket,
            message
        });

        log.debug(`sending message to ${this.socket}`, message);
    }

    login() {
        this.world.addEntity('players', this);

        this.sendWorldInfo();
        this.sendGameSettings();
        this.sendPrivacySettings();
        this.sendStats();
        this.sendQuestList();
        this.sendFatigue();
        this.inventory.sendAll();
        this.sendEquipmentBonuses();
        this.sendFriendList();
        this.sendIgnoreList();

        // check the cache's sendAppearance in case the player disconnected
        // before they finished
        if (!this.loginDate || this.cache.sendAppearance) {
            this.lock();
            this.sendAppearance();
        }

        this.message('Welcome to RuneScape!');

        this.localEntities.updateNearby('npcs');
        this.localEntities.updateNearby('players');
        this.localEntities.updateNearby('gameObjects');
        this.localEntities.updateNearby('wallObjects');
        this.localEntities.updateNearby('groundItems');

        this.broadcastPlayerAppearance(true);

        this.loggedIn = true;
        log.info(`${this} logged in`);
    }

    async logout() {
        if (!this.loggedIn) {
            return;
        }

        this.loggedIn = false;

        if (this.dontAnswer) {
            this.dontAnswer();
        }

        if (this.interfaceOpen.shop) {
            this.exitShop(true);
        }

        if (this.interfaceOpen.trade) {
            this.trade.decline();
        }

        this.send({ type: 'logoutSuccess' });

        await this.world.sleepTicks(2);
        this.socket.close();

        process.nextTick(() => {
            this.world.removeEntity('players', this);
            this.world.server.dataClient.playerLogout(this.username);
            log.info(`${this} logged out`);
        });

        await this.save();
    }

    async getFriendWorld(username) {
        const {
            usernameWorlds
        } = await this.world.server.dataClient.sendAndReceive({
            handler: 'playerGetWorlds',
            usernames: [username]
        });

        return usernameWorlds[username];
    }

    async addFriend(username) {
        username = username.toLowerCase();

        this.friends.push(username);

        const worldID = await this.getFriendWorld(username);

        if (worldID > 0) {
            this.sendFriendWorld(username, worldID);
        }
    }

    removeFriend(username) {
        username = username.toLowerCase();
        this.friends.splice(this.friends.indexOf(username), 1);
    }

    // send a private message to the player
    receivePrivateMessage(from, message) {
        this.send({ type: 'friendMessage', username: from, message });
    }

    // send a private message FROM the player to another player
    sendPrivateMessage(toUsername, message) {
        this.world.server.dataClient.playerMessage(
            this.username,
            toUsername,
            message
        );
    }

    addIgnore(username) {
        this.ignores.push(username);
    }

    removeIgnore(username) {
        this.ignores.splice(this.ignores.indexOf(username), 1);
    }

    async sendFriendList() {
        const {
            usernameWorlds
        } = await this.world.server.dataClient.sendAndReceive({
            handler: 'playerGetWorlds',
            usernames: this.friends
        });

        this.send({
            type: 'friendList',
            usernames: this.friends.map((username) => {
                let worldID = usernameWorlds[username];

                if (worldID === this.world.id) {
                    worldID = 255;
                } else if (worldID > 0) {
                    worldID += 219;
                }

                return { username, world: worldID };
            })
        });
    }

    sendIgnoreList() {
        this.send({
            type: 'ignoreList',
            usernames: this.ignores
        });
    }

    sendFriendWorld(username, worldID) {
        if (worldID === this.world.id) {
            worldID = 255;
        } else if (worldID > 0) {
            worldID += 219;
        }

        this.send({
            type: 'friendStatusChange',
            username,
            world: worldID
        });
    }

    // white server-sided message in the chat box
    message(...messages) {
        for (const message of messages) {
            this.send({ type: 'message', message: '' + message });
        }
    }

    // sent on login
    sendWorldInfo() {
        this.send({
            type: 'worldInfo',
            index: this.index,
            planeWidth: this.world.planeWidth,
            planeHeight: this.world.planeHeight,
            planeIndex: this.getElevation(),
            planeMultiplier: this.world.planeElevation
        });
    }

    sendGameSettings() {
        this.send({
            type: 'gameSettings',
            cameraAuto: this.cameraAuto,
            oneMouseButton: this.oneMouseButton,
            soundOn: this.soundOn
        });
    }

    sendPrivacySettings() {
        this.send({
            type: 'privacySettings',
            chat: this.blockChat,
            privateChat: this.blockPrivateChat,
            trade: this.blockTrade,
            duel: this.blockDuel
        });
    }

    sendEquipmentBonuses() {
        this.send({
            type: 'playerStatEquipmentBonus',
            ...this.equipmentBonuses
        });
    }

    // the appearance screen for new accounts or make-over mage
    sendAppearance() {
        this.lock();
        this.interfaceOpen.appearance = true;
        this.send({ type: 'appearance' });
    }

    // send our skills and quest points on login
    sendStats() {
        this.send({
            type: 'playerStatList',
            skills: this.skills,
            questPoints: this.questPoints
        });
    }

    sendQuestList() {
        this.send({
            type: 'playerQuestList',
            questCompletion: quests.map((name) => {
                return this.questStages[name] && this.questStages[name] === -1;
            })
        });
    }

    // update experience in a single skill
    sendExperience(skill) {
        const index = Object.keys(this.skills).indexOf(skill);

        if (index < 0) {
            throw new RangeError(`invalid skill ${skill}`);
        }

        this.send({
            type: 'playerStatExperienceUpdate',
            index,
            experience: this.skills[skill].experience
        });
    }

    // refresh player's fatigue
    sendFatigue() {
        this.send({
            type: 'playerStatFatigue',
            fatigue: Math.floor(this.fatigue / 100)
        });
    }

    // play sound (only for members clients)
    sendSound(soundName) {
        if (!this.world.members) {
            return;
        }

        this.send({ type: 'sound', soundName });
    }

    sendPrayerStatus() {
        this.send({ type: 'prayerStatus', prayersOn: this.prayers });
    }

    // the blue menu text prompting the player for a choice. if repeat is true,
    // the player will say the option they picked
    async ask(options, repeat = false) {
        this.send({
            type: 'optionList',
            options
        });

        const choice = await new Promise((resolve, reject) => {
            this.answer = resolve;

            this.dontAnswer = () => {
                this.answer = null;
                this.dontAnswer = null;

                if (this.interlocutor) {
                    this.disengage();
                }

                reject(new Error('interrupted ask'));
            };
        });

        this.answer = null;
        this.dontAnswer = null;

        if (choice > options.length) {
            throw new RangeError(
                `invalid option selected (${choice}/${options.length})`
            );
        }

        if (repeat) {
            await this.say(options[choice]);
        }

        return choice;
    }

    // open the welcome box
    sendWelcome() {
        const lastLoginDays = Math.floor(
            (Date.now() - this.loginDate) / (1000 * 60 * 60 * 24)
        );

        this.send({
            type: 'welcome',
            lastIP: this.lastIP,
            lastLoginDays,
            unreadMessages: 0
        });
    }

    // oh dear you are dead!
    sendDeath() {
        this.sendSound('death');
        this.send({ type: 'playerDied' });
    }

    // show bubble above player's head with certain item
    sendBubble(itemID) {
        const message = {
            index: this.index,
            id: itemID
        };

        this.localEntities.characterUpdates.playerBubbles.push(message);

        for (const player of this.localEntities.known.players) {
            player.localEntities.characterUpdates.playerBubbles.push(message);
        }
    }

    sendProjectile(victim, sprite = 0) {
        const message = {
            index: this.index,
            victimType: victim.constructor.name === 'NPC' ? 3 : 4,
            projectileType: sprite,
            victimIndex: victim.index
        };

        this.localEntities.characterUpdates.projectiles.push(message);

        for (const player of this.localEntities.known.players) {
            player.localEntities.characterUpdates.projectiles.push(message);
        }
    }

    // send the red hitsplat
    damage(damage) {
        const isDead = super.damage(damage);
        this.sendStats();
        return isDead;
    }

    // send the blue or red teleport bubbles to the nearby players
    sendTeleportBubble(x, y, type) {
        this.send({
            type: 'teleportBubble',
            bubbleType: +(type === 'telegrab'),
            x: x - this.x,
            y: y - this.y
        });
    }

    openShop(shopName) {
        const shop = this.world.shops.get(shopName);

        if (!shop) {
            throw new RangeError(`invalid shop name ${shopName}`);
        }

        this.lock();

        this.interfaceOpen.shop = true;
        shop.occupants.add(this);
        this.shop = shop;

        this.send({
            type: 'shopOpen',
            items: shop.items.map((item) => ({
                id: item.id,
                amount: item.amount,
                price: shop.getItemDeltaPrice(item)
            })),
            general: shop.definition.general,
            buyMultiplier: shop.definition.buyMultiplier,
            sellMultiplier: shop.definition.sellMultiplier
        });
    }

    exitShop(send = true) {
        this.interfaceOpen.shop = false;
        this.unlock();

        if (this.shop) {
            this.shop.occupants.delete(this);
            this.shop = null;
        }

        if (send) {
            this.send({ type: 'shopClose' });
        }
    }

    refreshSleepWord() {
        const { world } = this;
        const { word, image } = world.captcha.generate();

        this.sleepWord = word;
        this.sleepImage = Captcha.toByteArray(image);
    }

    openSleep(bed = true) {
        this.walkQueue.length = 0;
        this.lock();
        this.interfaceOpen.sleep = true;

        this.sleepBed = bed;
        this.refreshSleepWord();

        this.send({ type: 'sleepOpen', captchaBytes: this.sleepImage });
    }

    exitSleep(refreshed = true) {
        this.unlock();
        this.interfaceOpen.sleep = false;

        if (refreshed) {
            this.fatigue = this.displayFatigue;
            this.sendFatigue();
            this.message('You wake up - feeling refreshed');
        } else {
            this.message('You are unexpectedly awoken! You still feel tired');
        }

        this.send({ type: 'sleepClose' });
    }

    sendSleepIncorrect() {
        this.send({ type: 'sleepIncorrect' });
    }

    // update the player's avatar
    setAppearance(appearance) {
        this.appearanceIndex += 1;

        this.appearance = {
            hairColour: appearance.hairColour,
            topColour: appearance.topColour,
            trouserColour: appearance.trouserColour,
            headSprite: appearance.headSprite,
            bodySprite: appearance.bodySprite,
            skinColour: appearance.skinColour
        };

        this.animations[0] = this.appearance.headSprite;
        this.animations[1] = this.appearance.bodySprite;
        this.animations[2] = 3;
    }

    // update our sprites, combat level, skull status, etc. to us and the
    // players we know about
    broadcastPlayerAppearance(self = false) {
        const { world } = this;
        const update = this.getAppearanceUpdate();

        world.nextTick(() => {
            if (self) {
                this.localEntities.characterUpdates.playerAppearances.push(
                    update
                );
            }

            for (const player of this.localEntities.known.players) {
                player.localEntities.characterUpdates.playerAppearances.push(
                    update
                );
            }
        });
    }

    // let everyone around us know about a message (don't send to self). if
    // dialogue is true, don't record the message in chat logs to the nearby
    // players.
    broadcastChat(message, dialogue = false) {
        const update = { index: this.index, message, dialogue };

        if (dialogue) {
            this.localEntities.characterUpdates.playerChat.push(update);
        }

        for (const player of this.localEntities.known.players) {
            if (
                !player.blockChat &&
                player.ignores.indexOf(this.username) === -1
            ) {
                player.localEntities.characterUpdates.playerChat.push(update);
            }
        }
    }

    // broadcast the player changing sprites
    broadcastDirection() {
        // temp debug
        if (!this.moveTick) {
            this.moveTick = this.world.ticks;
        } else {
            if (this.moveTick === this.world.ticks) {
                throw new Error('two broadcasts in one tick');
            }

            this.moveTick = this.world.ticks;
        }

        for (const player of this.localEntities.known.players) {
            if (!player.loggedIn) {
                continue;
            }

            if (
                !player.localEntities.added.players.has(this) &&
                !player.localEntities.removed.players.has(this)
            ) {
                player.localEntities.spriteChanged.players.add(this);
            }
        }
    }

    // broadcast the player moving in their current direction
    broadcastMove() {
        if (!this.moveTick) {
            this.moveTick = this.world.ticks;
        } else {
            if (this.moveTick === this.world.ticks) {
                throw new Error('two broadcasts in one tick');
            }

            this.moveTick = this.world.ticks;
        }

        for (const player of this.getNearbyEntities('players', 16)) {
            if (!player.loggedIn) {
                continue;
            }

            if (!player.localEntities.known.players.has(this)) {
                player.localEntities.added.players.add(this);
            } else {
                player.localEntities.moved.players.add(this);
            }
        }
    }

    broadcastDamage(damage) {
        const message = {
            index: this.index,
            damageTaken: damage,
            currentHealth: this.skills.hits.current,
            maxHealth: this.skills.hits.base
        };

        this.localEntities.characterUpdates.playerHits.push(message);

        for (const player of this.localEntities.known.players) {
            player.localEntities.characterUpdates.playerHits.push(message);
        }
    }

    // add experience to a skill, optionally with fatigue
    addExperience(skill, experience, useFatigue = true) {
        if (useFatigue) {
            if (this.fatigue >= MAX_FATIGUE) {
                this.message(
                    '@gre@You are too tired to gain experience, get some rest!'
                );

                return false;
            }

            const fatigueRate = /^(attack|defense|strength|hits)$/.test(skill)
                ? 2.5
                : 4;

            this.fatigue = Math.min(
                MAX_FATIGUE,
                Math.floor(this.fatigue + fatigueRate * experience)
            );

            this.sendFatigue();
        }

        const { world } = this;

        experience *= world.server.config.experienceRate;

        const nextLevel = experienceToLevel(
            this.skills[skill].experience + experience
        );

        this.skills[skill].experience += experience;

        if (nextLevel !== this.skills[skill].base) {
            const levelDelta = nextLevel - this.skills[skill].base;

            this.skills[skill].base = nextLevel;
            this.skills[skill].current += levelDelta;

            // sic
            this.message(
                `@gre@You just advanced ${levelDelta} ` +
                    `${formatSkillName(skill).toLowerCase()} level!`
            );

            this.sendStats();
            this.sendSound('advance');

            const combatLevel = this.getCombatLevel();

            if (this.combatLevel !== combatLevel) {
                this.combatLevel = combatLevel;
                this.broadcastPlayerAppearance(true);
            }
        } else {
            this.sendExperience(skill);
        }

        return true;
    }

    addQuestPoints(questPoints) {
        this.questPoints += questPoints;
        this.sendStats();
        this.sendQuestList();
    }

    die() {
        const { world } = this;

        const victor = this.opponent;

        if (victor) {
            victor.retreat();
        }

        this.healTicks = 0;

        const itemsKept = this.inventory.removeMostValuable(
            3 + (this.prayers[8] ? 1 : 0)
        );

        for (const item of this.inventory.items) {
            world.addPlayerDrop(this, item);
        }

        this.inventory.items.length = 0;

        const { spawnX, spawnY } = regions.lumbridge;
        this.teleport(spawnX, spawnY, false);

        for (const skill of Object.keys(this.skills)) {
            this.skills[skill].current = this.skills[skill].base;
        }

        this.sendStats();
        this.inventory.sendAll();

        for (const item of itemsKept) {
            this.inventory.add(item);
        }

        this.sendDeath();

        if (victor) {
            victor.opponent = null;
            this.opponent = null;
        }
    }

    getAppearanceUpdate() {
        return {
            index: this.index,
            appearanceIndex: this.appearanceIndex,
            username: this.username,
            animations: this.animations,
            ...this.appearance,
            combatLevel: this.combatLevel,
            skulled: this.isSkulled()
        };
    }

    // get a player's base level in a skill, without stat modifiers like potions
    // or beer
    getBaseLevel(skillName) {
        return experienceToLevel(this.skills[skillName].experience);
    }

    // https://classic.runescape.wiki/w/Combat_level
    getCombatLevel() {
        const offence =
            (this.skills.attack.base + this.skills.strength.base) * 0.25;

        const defense =
            (this.skills.defense.base + this.skills.hits.base) * 0.25;

        const magic =
            (this.skills.prayer.base + this.skills.magic.base) * 0.125;

        const ranged = this.skills.ranged.base * 0.375;

        return Math.floor(defense + magic + Math.max(offence, ranged));
    }

    // get the total drain rate from all of the enabled prayers. this is added
    // to drain counter each tick
    getPrayerDrainRate() {
        let drainEffect = 0;

        for (const [index, enabled] of this.prayers.entries()) {
            if (enabled) {
                drainEffect += prayers[index].drain;
            }
        }

        return drainEffect;
    }

    // this is the amount drain counter must reach before losing a prayer point
    getPrayerDrainResistance() {
        return 60 + this.equipmentBonuses.prayer * 2;
    }

    getElevation() {
        return Math.floor(this.y / this.world.planeElevation);
    }

    getFormattedUsername() {
        return this.username[0].toUpperCase() + this.username.slice(1);
    }

    isMale() {
        return this.appearance.bodySprite === 2;
    }

    isSkulled() {
        return false;
    }

    isMuted() {
        if (this.muteEndDate === 0) {
            return false;
        }

        // permanent mute
        if (this.muteEndDate === -1) {
            return true;
        }

        return Date.now() < this.muteEndDate;
    }

    isAdministrator() {
        return this.rank >= 3;
    }

    isTired(offset = 0) {
        return this.fatigue >= MAX_FATIGUE - offset;
    }

    canChat() {
        return !this.isMuted() && Date.now() - this.lastChat > 150;
    }

    hasInterfaceOpen() {
        for (const value of Object.values(this.interfaceOpen)) {
            if (value) {
                return true;
            }
        }

        return false;
    }

    // enter a wall object with a blocked doorframe and close it
    async enterDoor(door, doorframeID = 11, delay = 1) {
        const { world, direction: oldDirection } = this;
        const { id: doorID, direction: doorDirection } = door;

        const doorframe = world.replaceEntity('wallObjects', door, doorframeID);
        this.sendSound('opendoor');

        if (doorDirection === 0) {
            this.walkTo(0, this.y < doorframe.y ? 1 : -1);
        } else if (doorDirection === 1) {
            this.walkTo(this.x < doorframe.x ? 1 : -1, 0);
        } else {
            this.walkTo(
                this.x < doorframe.x ? 1 : -1,
                this.y < doorframe.y ? 1 : -1
            );
        }

        await world.sleepTicks(1);

        if (!this.isWalking && !this.opponent) {
            // this seems to be accurate behaviour, see videos like:
            // https://youtu.be/KPJYewzuHI8?t=501
            this.direction = oldDirection;
            this.broadcastDirection();
        }

        await world.sleepTicks(delay);
        world.replaceEntity('wallObjects', doorframe, doorID);
    }

    // enter a gate with blocked open gate and close it
    async enterGate(gate, openGateID = 181) {
        const { world } = this;
        const { id: gateID, direction } = gate;

        let deltaX = 0;
        let deltaY = 0;

        if (direction === 0) {
            if (this.x >= gate.x) {
                await this.walkToPoint(gate.x, gate.y, true);
                deltaX = -1;
            } else {
                await this.walkToPoint(gate.x - 1, gate.y, true);
                deltaX = 1;
            }
        } else if (direction === 4) {
            if (this.x <= gate.x) {
                await this.walkToPoint(gate.x, gate.y, true);
                deltaX = 1;
            } else {
                await this.walkToPoint(gate.x + 1, gate.y, true);
                deltaX = -1;
            }
        } else if (direction === 6) {
            if (this.y >= gate.y) {
                await this.walkToPoint(gate.x, gate.y, true);
                deltaY -= 1;
            } else {
                await this.walkToPoint(gate.x, gate.y - 1, true);
                deltaY += 1;
            }
        }

        this.faceDirection(0, 0);
        await world.sleepTicks(1);

        const openGate = world.replaceEntity('gameObjects', gate, openGateID);

        this.walkTo(deltaX, deltaY);
        this.message('The gate swings open');
        this.sendSound('opendoor');

        await world.sleepTicks(1);

        world.replaceEntity('gameObjects', openGate, gateID);

        this.faceDirection(0, 0);
        await world.sleepTicks(1);
    }

    // climb ladders or stairs (go up or down a plane)
    climb(gameObject, up = false) {
        const { world } = this;
        const direction = this.direction;
        const height = gameObject.definition.height;

        if (height > 1) {
            let xOffset = 0;
            let yOffset = 0;

            switch (gameObject.direction) {
                case 0:
                    yOffset = up ? height : -1;
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

            this.teleport(
                gameObject.x + xOffset,
                gameObject.y + world.planeElevation * (up ? 1 : -1) + yOffset
            );
        } else {
            this.teleport(
                this.x,
                this.y + world.planeElevation * (up ? 1 : -1)
            );
        }

        this.direction = direction;
    }

    teleport(x, y, bubble = false) {
        const { world } = this;

        if (y < 0) {
            y += this.world.planeElevation * 4;
        }

        y = y % (this.world.planeElevation * 4);

        this.lock();
        this.endWalkFunction = null;
        this.walkQueue.length = 0;

        if (bubble) {
            this.sendTeleportBubble(this.x, this.y);

            for (const player of this.localEntities.known.players) {
                player.sendTeleportBubble(this.x, this.y);
                player.localEntities.removed.players.add(this);
            }
        }

        world.nextTick(() => {
            this.faceDirection(0, 0);
        });

        if (this.x === x && this.y === y) {
            return;
        }

        this.localEntities.clear();

        this.world.setTickTimeout(() => {
            this.x = x;
            this.y = y;

            this.sendWorldInfo();
            this.localEntities.updateNearby('npcs');
            this.localEntities.updateNearby('gameObjects');
            this.localEntities.updateNearby('wallObjects');

            this.unlock();
        }, 2);
    }

    // runs separately from restoreSkills due to the separation of
    // rapid heal and rapid restore prayers
    restoreHealth() {
        if (this.healTicks > 0) {
            this.healTicks -= 1 + Number(this.prayers[RAPID_HEAL_ID]);
            return false;
        }

        this.healTicks = RESTORE_TICKS;

        if (this.skills.hits.current < this.skills.hits.base) {
            this.skills.hits.current += 1;
            return true;
        }

        return false;
    }

    restoreSkills() {
        if (this.restoreTicks > 0) {
            this.restoreTicks -= 1 + Number(this.prayers[RAPID_RESTORE_ID]);
            return false;
        }

        let updated = false;

        this.restoreTicks = RESTORE_TICKS;

        for (const [skillName, { base, current }] of Object.entries(
            this.skills
        )) {
            if (skillName === 'hits' || skillName === 'prayer') {
                continue;
            }

            if (current < base) {
                this.skills[skillName].current += 1;
                updated = true;
            }
        }

        return updated;
    }

    debuffSkills() {
        if (this.debuffTicks > 0) {
            this.debuffTicks -= 1;
            return;
        }

        let updated = false;

        this.debuffTicks = RESTORE_TICKS;

        for (const [skillName, { base, current }] of Object.entries(
            this.skills
        )) {
            if (skillName === 'prayer') {
                continue;
            }

            if (current > base) {
                this.skills[skillName].current -= 1;
                updated = true;
            }
        }

        return updated;
    }

    // every tick, the drain rates of all the combined prayers is added to
    // the drain counter. once the drain counter reaches your prayer resistance
    // (a formula that takes into account your gear bonuses), it resets and
    // you lose a prayer point.
    drainPrayer() {
        if (this.skills.prayer.current <= 0) {
            return false;
        }

        const drainRate = this.getPrayerDrainRate();

        if (drainRate < 1) {
            return false;
        }

        let updated = false;

        this.prayerDrainCounter += drainRate;

        if (this.prayerDrainCounter >= this.getPrayerDrainResistance()) {
            this.prayerDrainCounter = 0;
            this.skills.prayer.current -= 1;
            updated = true;
        }

        if (this.skills.prayer.current <= 0) {
            this.message(
                'You have run out of prayer points. Return to a church to ' +
                    'recharge'
            );

            for (let i = 0; i < this.prayers.length; i += 1) {
                this.prayers[i] = false;
            }

            this.sendPrayerStatus();
        }

        return updated;
    }

    // run each tick to debuff skills, drain prayer etc.
    normalizeSkills() {
        if (
            this.restoreHealth() ||
            this.restoreSkills() ||
            this.debuffSkills() ||
            this.drainPrayer()
        ) {
            this.sendStats();
        }
    }

    // send the fatigue as it lowers in the client's sleep screen
    refreshDisplayFatigue() {
        if (this.displayFatigue > 0) {
            this.displayFatigue -= this.sleepBed
                ? SLEEP_BED_RATE
                : SLEEP_BAG_RATE;

            if (this.displayFatigue < 0) {
                this.displayFatigue = 0;
            }
        }

        this.send({
            type: 'playerStatFatigueAsleep',
            fatigue: Math.floor(this.displayFatigue / 100)
        });
    }

    // run during each tick of melee combat
    fight() {
        if (this.fightStage % 3 === 0) {
            const isPlayer = !!this.opponent.username;

            const damage = isPlayer
                ? rollPlayerPlayerDamage(this, this.opponent)
                : rollPlayerNPCDamage(this, this.opponent);

            this.opponent.damage(damage, this);
            this.fightStage = 1;
            this.combatRounds += 1;
        } else {
            this.fightStage += 1;
        }
    }

    async shootRanged(character) {
        if (typeof this.rangedTimeout === 'number') {
            this.world.clearTickTimeout(this.rangedTimeout);
            delete this.rangedTimeout;
        }

        this.walkQueue.length = 0;

        if (
            this.getDistance(character) <= 1.5 &&
            this.withinLineOfSight(character)
        ) {
            return character.attack(this);
        }

        const rangedWeapon = this.inventory.getRangedWeapon();

        if (!rangedWeapon || character.skills.hits.current <= 0) {
            return false;
        }

        const { world } = this;
        const { range } = rangedWeapons[rangedWeapon.id];

        if (!this.withinRange(character, range * 2, true)) {
            await world.sleepTicks(1);
            await this.chase(character);

            if (!this.withinRange(character, range * 2, true)) {
                this.message("I can't get close enough");
                return false;
            }
        }

        if (!this.withinLineOfSight(character, true)) {
            this.message("I can't get a clear shot from here");
            this.rangedTimeout = -1;

            this.world.setTickTimeout(() => {
                delete this.rangedTimeout;
            }, 2);

            return false;
        }

        const ammunitionID = this.inventory.getAmmunitionID();

        if (ammunitionID === -1) {
            return false;
        }

        this.faceDirection(-1, 1);

        this.inventory.remove(ammunitionID);

        if (Math.random() >= 0.2) {
            const [arrowStack] = world.groundItems
                .getAtPoint(character.x, character.y)
                .filter(
                    ({ id, owner }) => id === ammunitionID && owner === this.id
                );

            if (arrowStack) {
                arrowStack.amount += 1;
            } else {
                world.addPlayerDrop(
                    this,
                    { id: ammunitionID },
                    character.x,
                    character.y
                );
            }
        }

        if (!this.inventory.has(ammunitionID)) {
            this.message("I've run out of ammo!");
        }

        // TODO player damage
        const damage = rollPlayerNPCRangedDamage(this, character);

        character.damage(damage, this);
        this.sendProjectile(character, 2);

        if (
            !character.locked &&
            character.constructor.name === 'NPC' &&
            character.chasing !== this
        ) {
            character
                .attack(this)
                .then(() => {
                    character.retreatTicks = 4;
                })
                .catch((err) => log.error(err));
        }

        if (this.inventory.getAmmunitionID(false) === -1) {
            return true;
        }

        this.rangedTimeout = world.setTickTimeout(() => {
            this.shootRanged(character);
        }, 4);

        return true;
    }

    tick() {
        this.normalizeSkills();

        if (this.interfaceOpen.sleep) {
            this.refreshDisplayFatigue();
        }

        if (this.opponent && this.opponent.skills.hits.current > 0) {
            this.fight();
        }

        this.localEntities.updateNearby('players');
        this.localEntities.updateNearby('groundItems');

        if (this.walkQueue.length && !this.locked) {
            const { deltaX, deltaY } = this.walkQueue.shift();

            if (this.canWalk(deltaX, deltaY)) {
                this.walkTo(deltaX, deltaY);
            } else {
                this.following = null;
                this.walkQueue.length = 0;
                this.faceDirection(deltaX * -1, deltaY * -1);
            }
        }

        if (!this.locked && this.following && this.following.walkQueue.length) {
            const { x, y } = this.following.getBackPoint();
            this.walkQueue = this.getPointSteps(x, y, false);
        }

        if (!this.walkQueue.length && !this.isWalking) {
            this.walkAction = false;

            if (this.endWalkFunction) {
                if (this.dontAnswer) {
                    this.dontAnswer();
                }

                if (this.locked || this.endWalkLocked) {
                    this.endWalkFunction = null;
                    return;
                }

                this.endWalkLocked = true;

                this.endWalkFunction()
                    .catch((e) => {
                        this.endWalkLocked = false;
                        this.walkAction = false;
                        log.error(e);
                    })
                    .then(() => {
                        this.endWalkLocked = false;
                        this.walkAction = false;
                    });

                this.endWalkFunction = null;
            }
        }

        this.isWalking = false;
    }

    async save() {
        let message = { handler: 'playerUpdate' };

        for (const property of SAVE_PROPERTIES) {
            if (typeof this.property === 'object') {
                message[property] = { ...this[property] };
            } else {
                message[property] = this[property];
            }
        }

        message = { ...message, ...this.appearance };

        for (const skillName of Object.keys(message.skills)) {
            delete message.skills[skillName].base;
        }

        await this.world.server.dataClient.sendAndReceive(message);
    }

    toString() {
        return `[Player (username=${this.username}, x=${this.x}, y=${this.y})]`;
    }

    walkTo(deltaX, deltaY) {
        if (this.dontAnswer) {
            this.dontAnswer();
        }

        super.walkTo(deltaX, deltaY);

        this.localEntities.updateNearby('npcs');

        const gameObjectViewport = this.localEntities.viewports.gameObjects / 2;

        if (
            this.x % gameObjectViewport === 0 ||
            this.y % gameObjectViewport === 0
        ) {
            this.localEntities.updateNearby('gameObjects');
        }

        const wallObjectViewport = this.localEntities.viewports.wallObjects / 2;

        if (
            this.x % wallObjectViewport === 0 ||
            this.y % wallObjectViewport === 0
        ) {
            this.localEntities.updateNearby('wallObjects');
        }
    }

    lock() {
        super.lock();

        if (typeof this.rangedTimeout === 'number') {
            this.world.clearTickTimeout(this.rangedTimeout);
            delete this.rangedTimeout;
        }

        this.walkQueue.length = 0;
    }
}

module.exports = Player;
