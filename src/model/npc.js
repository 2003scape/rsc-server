const Character = require('./character');
const GroundItem = require('./ground-item');
const drops = require('@2003scape/rsc-data/rolls/drops');
const npcRespawn = require('@2003scape/rsc-data/npc-respawn');
const npcs = require('@2003scape/rsc-data/config/npcs');
const items = require('@2003scape/rsc-data/config/items');
const { rollItemDrop } = require('../rolls');

const HERB_IDS = new Set(drops.herb.map((entry) => entry.id));

class NPC extends Character {
    constructor(world, { id, x, y, minX, maxX, minY, maxY }) {
        super(world);

        this.id = id;
        this.x = x;
        this.y = y;
        this.minX = minX;
        this.maxX = maxX;
        this.minY = minY;
        this.maxY = maxY;

        this.definition = npcs[id];

        if (!this.definition) {
            throw new RangeError(`invalid NPC id ${this.id}`);
        }

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

    async say(...messages) {
        for (const message of messages) {
            this.broadcastChat(message);
            await this.world.sleepTicks(1);

            if (message.length >= 25) {
                await this.world.sleepTicks(2);
            }
        }

        await this.world.sleepTicks(1);
    }

    attack(player) {}

    damage(damage) {}

    retreat(ticks = 8) {}

    pursue(player) {}

    // get a list of GroundItem instances from the NPC's drop table
    getDrops() {
        let drops = rollItemDrop(drops, this.id);

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

        return drops.map((drop) => {
            return new GroundItem(this.world, {
                ...drop,
                x: this.x,
                y: this.y
            });
        });
    }

    updateKnownPlayers() {
        for (const player of this.knownPlayers) {
            if (!player.loggedIn || !player.withinRange(this, 16)) {
                player.localEntities.removed.npcs.add(this);
                player.localEntities.movedCharacters.npcs.delete(this);
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

    canWalk(deltaX, deltaY) {
        const destX = this.x + deltaX;
        const destY = this.y + deltaY;

        if (
            destX > this.maxX ||
            destX < this.minX ||
            destY > this.maxY ||
            destY < this.minY
        ) {
            return false;
        }

        return super.canWalk(deltaX, deltaY);
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

        this.updateKnownPlayers();

        for (const player of this.knownPlayers) {
            player.localEntities.movedCharacters.npcs.add(this);
        }
    }

    walkNextRandomStep() {
        if (this.stepsLeft > 0) {
            let deltaX = 0;
            let deltaY = 0;

            if (Math.random() < 0.5) {
                deltaX = Math.random() > 0.5 ? 1 : -1;
            }

            if (Math.random() < 0.5) {
                deltaY = Math.random() > 0.5 ? 1 : -1;
            }

            if (this.canWalk(deltaX, deltaY)) {
                this.stepsLeft -= 1;
                this.walkTo(deltaX, deltaY);
            }
        } else {
            if (Math.random() > 0.75) {
                this.stepsLeft = Math.floor(Math.random() * 25) + 1;
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
            player.localEntities.spriteChangedCharacters.npcs.add(this);
        }
    }

    tick() {
        if (
            !this.stationary && !this.locked &&
            (this.knownPlayers.size || this.stepsLeft > 0)
        ) {
            this.walkNextRandomStep();
        }
    }

    toString() {
        return `[NPC (id=${this.id}, x=${this.x}, y=${this.y})]`;
    }
}

module.exports = NPC;
