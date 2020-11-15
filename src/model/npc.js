const Character = require('./character');
const dropDefinitions = require('@2003scape/rsc-data/rolls/drops');
const items = require('@2003scape/rsc-data/config/items');
const npcRespawn = require('@2003scape/rsc-data/npc-respawn');
const npcs = require('@2003scape/rsc-data/config/npcs');
const { rollItemDrop } = require('../rolls');
const { rollNPCDamage } = require('../combat');

const HERB_IDS = new Set(dropDefinitions.herb.map((entry) => entry.id));

class NPC extends Character {
    constructor(world, { id, x, y, minX, maxX, minY, maxY }) {
        super(world);

        this.id = id;
        this.spawnX = x;
        this.spawnY = y;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;

        this.x = this.spawnX;
        this.y = this.spawnY;

        this.definition = npcs[id];

        if (!this.definition) {
            throw new RangeError(`invalid NPC id ${this.id}`);
        }

        // store aggressive here because we make every NPC in the wilderness
        // aggressive
        this.aggressive = this.definition.aggressive;

        this.respawn = npcRespawn[id];

        this.skills = {
            attack: {
                current: this.definition.attack,
                base: this.definition.attack
            },
            strength: {
                current: this.definition.strength,
                base: this.definition.strength
            },
            hits: {
                current: this.definition.hits,
                base: this.definition.hits
            },
            defense: {
                current: this.definition.defense,
                base: this.definition.defense
            }
        };

        // used for automatic movement
        this.stepsLeft = 0;

        // used so we don't bother calculating steps for stationary NPCs
        this.stationary =
            this.x === minX &&
            this.x === maxX &&
            this.y === minY &&
            this.y === maxY;

        // we only need to know which players can see the NPC
        this.knownPlayers = new Set();
    }

    getDrops() {
        let drops = rollItemDrop(dropDefinitions, this.id);

        if (!this.world.members) {
            // on free-to-play worlds, drop 10 coins instead of unid'd herbs
            for (const drop of drops) {
                if (HERB_IDS.has(drop.id)) {
                    drop.id = 10;
                    drop.amount = 10;
                }
            }

            drops = drops.filter((drop) => !items[drop.id].members);
        }

        return drops;
    }

    die() {
        const { world } = this;

        world.removeEntity('npcs', this);

        let maxDamage = 0;
        let victorID = -1;

        for (const [playerID, damage] of this.playerDamage.entries()) {
            if (damage > maxDamage) {
                maxDamage = damage;
                victorID = playerID;
            }
        }

        let victor;

        if (victorID === -1) {
            return;
        }

        victor = world.players.getByID(victorID);

        if (!victor) {
            victor = this.opponent;
        }

        victor.retreat();
        victor.sendSound('victory');

        const drops = this.getDrops();

        for (const item of drops) {
            world.addPlayerDrop(victor, item);
        }

        world.callPlugin('onNPCDeath', victor, this).catch((e) => log.error(e));
    }

    updateKnownPlayers() {
        for (const player of this.knownPlayers) {
            if (!player.loggedIn || !player.withinRange(this, 16)) {
                player.localEntities.removed.npcs.add(this);
                player.localEntities.moved.npcs.delete(this);
                this.knownPlayers.delete(player);
            }
        }

        for (const player of this.getNearbyEntities('players', 16)) {
            if (!player.loggedIn) {
                break;
            }

            if (!player.localEntities.known.npcs.has(this)) {
                player.localEntities.added.npcs.add(this);
            }

            this.knownPlayers.add(player);
        }
    }

    withinWalkBounds(destX, destY) {
        if (
            destX > this.maxX ||
            destX < this.minX ||
            destY > this.maxY ||
            destY < this.minY
        ) {
            return false;
        }

        return true;
    }

    canWalk(deltaX, deltaY) {
        const destX = this.x + deltaX;
        const destY = this.y + deltaY;

        if (!this.withinWalkBounds(destX, destY)) {
            return false;
        }

        return super.canWalk(deltaX, deltaY);
    }

    walkNextRandomStep() {
        if (this.stepsLeft > 0) {
            if (
                this.stepsLeft < 3 &&
                Math.random() <= 2 / 3 &&
                this.canWalk(this.lastDeltaX, this.lastDeltaY)
            ) {
                this.stepsLeft -= 1;
                this.walkTo(this.lastDeltaX, this.lastDeltaY);
            } else {
                let deltaX = 0;
                let deltaY = 0;

                if (Math.random() <= 0.5) {
                    deltaX = Math.random() <= 0.5 ? 1 : -1;
                }

                if (Math.random() <= 0.5) {
                    deltaY = Math.random() <= 0.5 ? 1 : -1;
                }

                if (this.canWalk(deltaX, deltaY)) {
                    this.stepsLeft -= 1;
                    this.lastDeltaX = deltaX;
                    this.lastDeltaY = deltaY;

                    this.walkTo(deltaX, deltaY);
                }
            }
        } else {
            if (Math.random() <= 0.15) {
                this.stepsLeft = Math.floor(Math.random() * 10) + 1;
            }
        }
    }

    broadcastChat(message) {
        for (const player of this.knownPlayers) {
            player.localEntities.characterUpdates.npcChat.push({
                npcIndex: this.index,
                playerIndex: this.interlocutor.index,
                message
            });
        }
    }

    broadcastDirection() {
        for (const player of this.knownPlayers) {
            player.localEntities.spriteChanged.npcs.add(this);
        }
    }

    broadcastMove() {
        for (const player of this.knownPlayers) {
            player.localEntities.moved.npcs.add(this);
        }
    }

    broadcastDamage(damage) {
        const message = {
            index: this.index,
            damageTaken: damage,
            currentHealth: this.skills.hits.current,
            maxHealth: this.skills.hits.base
        };

        for (const player of this.knownPlayers) {
            player.localEntities.characterUpdates.npcHits.push(message);
        }
    }

    fight() {
        if (this.fightStage % 3 === 0) {
            const damage = rollNPCDamage(this, this.opponent);
            this.opponent.damage(damage);
            this.fightStage = 1;
            this.combatRounds += 1;
        } else {
            this.fightStage += 1;
        }
    }

    tick() {
        if (this.opponent) {
            this.fight();
        }

        if (!this.stationary && !this.locked && this.knownPlayers.size) {
            this.updateKnownPlayers();

            if (!this.chasing) {
                this.walkNextRandomStep();
            }
        }
    }

    toString() {
        return `[NPC (id=${this.id}, x=${this.x}, y=${this.y})]`;
    }
}

module.exports = NPC;
