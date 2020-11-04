const Bank = require('./bank');
const Captcha = require('@2003scape/rsc-captcha');
const Character = require('./character');
const Inventory = require('./inventory');
const LocalEntities = require('./local-entities');
const log = require('bole')('player');
const regions = require('@2003scape/rsc-data/regions');
const { formatSkillName, experienceToLevel } = require('../skills');

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

const SLEEP_BAG_RATE = 4125;
const SLEEP_BED_RATE = 16500;
const MAX_FATIGUE = 75000;

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

        this.inventory = new Inventory(this, playerData.inventory);
        this.inventory.updateEquipmentBonuses();

        this.bank = new Bank(this, playerData.bank);

        this.combatLevel = this.getCombatLevel();

        this.interfaceOpen = {
            bank: false,
            shop: false,
            sleep: false,
            appearance: false
        };

        // current shop open the player has open, if any
        this.shop = null;

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

        this.loggedIn = false;
    }

    // send a packet if the socket is connected
    send(message) {
        if (!this.socket) {
            return;
        }

        this.socket.sendMessage(message);

        log.debug(`sending message to ${this.socket}`, message);
    }

    login() {
        this.world.addEntity('players', this);

        this.sendWorldInfo();
        this.sendGameSettings();
        this.sendPrivacySettings();
        this.sendStats();
        this.sendFatigue();
        this.inventory.sendAll();
        this.sendEquipmentBonuses();

        // check the cache's sendAppearance in case the player disconnected
        // before they finished
        if (!this.loginDate || this.cache.sendAppearance) {
            this.sendAppearance();
        }

        this.message('Welcome to RuneScape!');

        this.localEntities.updateNearby('npcs');
        this.localEntities.updateNearby('players');
        this.localEntities.updateNearby('gameObjects');
        this.localEntities.updateNearby('wallObjects');
        this.localEntities.updateNearby('groundItems');

        // tell ourselves our appearance
        this.localEntities.characterUpdates.playerAppearances.push(
            this.getAppearanceUpdate()
        );

        this.world.setTickTimeout(() => {
            // tell everyone around us our appearance
            this.broadcastPlayerAppearance();

            // make everyone around us tell us their appearance
            for (const player of this.localEntities.known.players) {
                this.localEntities.characterUpdates.playerAppearances.push(
                    player.getAppearanceUpdate()
                );
            }
        }, 2);

        this.loggedIn = true;
        log.info(`${this} logged in`);
    }

    async logout() {
        if (!this.loggedIn) {
            return;
        }

        this.exitShop(true);

        this.loggedIn = false;

        this.send({ type: 'logoutSuccess' });

        await this.world.sleepTicks(1);

        this.socket.close();

        process.nextTick(() => {
            this.world.removeEntity('players', this);

            this.world.server.dataClient.send({
                handler: 'playerLogout',
                username: this.username
            });

            log.info(`${this} logged out`);
        });

        await this.save();
    }

    addFriend(username) {
        this.friends.push(username);
    }

    removeFriend(username) {
        this.friends.splice(1, this.friends.indexOf(username));
    }

    // send a private message to the player
    receivePrivateMessage(from, message) {
        this.message(`@pri@@cya@${from} tells you: ${message}`);
    }

    // send a private message FROM the player to another player
    sendPrivateMessage(to, message) {
        this.dataClient.playerMessage(this.username, to, message);
        this.message(`@pri@@cya@You tell ${to} ${message}`);
    }

    // make the player emit dialogue, usually with an NPC. automatically delay
    // between messages
    async say(...messages) {
        for (const message of messages) {
            this.broadcastChat(message, true);
            await this.world.sleepTicks(2);
        }
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

        await this.world.sleepTicks(1);

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

    // send the red hitsplat
    damage(damage) {
        this.skills.hits.current -= damage;

        if (this.skills.hits.current <= 0) {
            this.die();
            return;
        }

        this.sendStats();

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

        this.send({ type: 'shopOpen', ...shop });
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
        const update = this.getAppearanceUpdate();

        if (self) {
            this.localEntities.characterUpdates.playerAppearances.push(update);
        }

        for (const player of this.localEntities.known.players) {
            player.localEntities.characterUpdates.playerAppearances.push(
                update
            );
        }
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
            player.localEntities.characterUpdates.playerChat.push(update);
        }
    }

    // broadcast the player changing sprites
    broadcastDirection() {
        for (const player of this.localEntities.known.players) {
            if (
                !player.localEntities.added.players.has(this) &&
                !player.localEntities.removed.players.has(this)
            ) {
                player.localEntities.spriteChangedCharacters.players.add(this);
            }
        }
    }

    // broadcast the player moving in their current direction
    broadcastMove() {
        for (const player of this.getNearbyEntities('players', 16)) {
            if (!player.loggedIn) {
                break;
            }

            if (!player.localEntities.known.players.has(this)) {
                player.localEntities.added.players.add(this);
            } else {
                player.localEntities.movedCharacters.players.add(this);
            }
        }
    }

    // add experience to a skill, optionally with fatigue
    addExperience(skill, experience, fatigueRate = 4) {
        if (fatigueRate > 0) {
            if (this.fatigue >= MAX_FATIGUE) {
                this.message(
                    '@gre@You are too tired to gain experience, get some rest!'
                );

                return false;
            }

            this.fatigue += fatigueRate * experience;
            this.sendFatigue();
        }

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
        } else {
            this.sendExperience(skill);
        }

        return true;
    }

    addQuestPoints(questPoints) {
        this.questPoints += questPoints;
        this.sendStats();
    }

    refreshSleepWord() {
        const captcha = new Captcha();
        const { word, image } = captcha.generate();

        this.sleepWord = word;
        this.sleepImage = Captcha.toByteArray(image);
    }

    die() {
        const itemsKept = this.inventory.removeMostValuable(3);

        for (const item of this.inventory.items) {
            this.world.addPlayerDrop(this, item);
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

    getCombatLevel() {
        const offence =
            (this.getBaseLevel('attack') + this.getBaseLevel('strength')) *
            0.25;

        const defense =
            (this.getBaseLevel('defense') + this.getBaseLevel('hits')) * 0.25;

        const magic =
            (this.getBaseLevel('prayer') + this.getBaseLevel('magic')) * 0.125;

        const ranged = this.getBaseLevel('ranged') * 0.375;

        return Math.floor(defense + magic + Math.max(offence, ranged));
    }

    getElevation() {
        return Math.floor(this.y / this.world.planeElevation);
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

    lock() {
        super.lock();
        this.walkQueue.length = 0;
    }

    canWalk(deltaX, deltaY) {
        if (!super.canWalk(deltaX, deltaY)) {
            return false;
        }

        const destX = this.x + deltaX;
        const destY = this.y + deltaY;

        // we aren't allowed to finish our path on a player (but walking through
        // them is fine)
        if (
            !this.walkQueue.length &&
            this.world.players.getAtPoint(destX, destY).length
        ) {
            return false;
        }

        return true;
    }

    faceDirection(deltaX, deltaY) {
        const direction = super.faceDirection(deltaX, deltaY);
        this.broadcastDirection();
        return direction;
    }

    faceEntity(entity) {
        const direction = super.faceEntity(entity);
        this.broadcastDirection();
        return direction;
    }

    walkTo(deltaX, deltaY) {
        super.walkTo(deltaX, deltaY);
        this.broadcastMove();
    }

    teleport(x, y, bubble = false) {
        if (y < 0) {
            y += this.world.planeElevation * 4;
        }

        y = y % (this.world.planeElevation * 4);

        this.endWalkFunction = null;
        this.walkQueue.length = 0;

        if (bubble) {
            this.sendTeleportBubble(this.x, this.y);

            for (const player of this.localEntities.known.players) {
                player.sendTeleportBubble(this.x, this.y);
                player.localEntities.removed.players.add(this);
            }
        }

        this.faceDirection(0, 0);

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
        }, 2);
    }

    tick() {
        this.localEntities.updateNearby('players');
        this.localEntities.updateNearby('groundItems');

        if (this.walkQueue.length) {
            if (this.dontAnswer) {
                this.dontAnswer();
            }

            const { deltaX, deltaY } = this.walkQueue.shift();

            if (this.canWalk(deltaX, deltaY)) {
                this.walkTo(deltaX, deltaY);

                this.localEntities.updateNearby('npcs');

                const gameObjectViewport =
                    this.localEntities.viewports.gameObjects / 2;

                if (
                    this.x % gameObjectViewport === 0 ||
                    this.y % gameObjectViewport === 0
                ) {
                    this.localEntities.updateNearby('gameObjects');
                }

                const wallObjectViewport =
                    this.localEntities.viewports.wallObjects / 2;

                if (
                    this.x % wallObjectViewport === 0 ||
                    this.y % wallObjectViewport === 0
                ) {
                    this.localEntities.updateNearby('wallObjects');
                }
            } else {
                this.walkQueue.length = 0;
                this.faceDirection(deltaX * -1, deltaY * -1);
            }
        }

        this.localEntities.sendRegions();

        if (!this.walkQueue.length && this.endWalkFunction) {
            if (this.dontAnswer) {
                this.dontAnswer();
            }

            if (this.locked) {
                this.endWalkFunction = null;
                return;
            }

            if (this.endWalkFunction.constructor.name === 'AsyncFunction') {
                this.endWalkFunction().catch((e) => log.error(e));
            } else {
                try {
                    this.endWalkFunction();
                } catch (e) {
                    log.error(e);
                }
            }

            this.endWalkFunction = null;
        }
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
}

module.exports = Player;
