// "mob" or mobile entities. this includes characters and players.

const Entity = require('./entity');
const directions = require('./directions');

// used to calculate a direction based on a change in coordinates. use
// deltaDirections[deltaX + 1][deltaY + 1] to get a direction number.
const deltaDirections = [
    [directions.southWest, directions.west, directions.northWest],
    [directions.south, null, directions.north],
    [directions.southEast, directions.east, directions.northEast]
];

function getDirection(deltaX, deltaY) {
    if (deltaX === 0 && deltaY === 0) {
        return 0;
    }

    return deltaDirections[deltaX + 1][deltaY + 1];
}

class Character extends Entity {
    constructor(world) {
        super(world);

        // direction number we're facing
        this.direction = 0;

        // the character we're fighting
        this.opponent = null;

        this.fightStage = -1;

        // the character we're talking to
        this.interlocutor = null;

        this.chasing = null;

        // can we move? certain NPCs still have conversation partners, but can
        // walk around (e.g. goblin generals in goblin diplomacy)
        this.locked = false;

        // animation IDs
        // see https://github.com/2003scape/rsc-config#configanimations
        this.animations = [];
        this.animations.length = 12;
        this.animations.fill(0, this.animations.length);

        // used to calculate who should get the drop
        // { player.id: damage }
        this.playerDamage = new Map();

        this.isWalking = false;
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }

    // make the character emit dialogue, usually with an NPC. automatically delay
    // between messages
    async say(...messages) {
        for (const message of messages) {
            this.broadcastChat(message, true);
            await this.world.sleepTicks(2);

            if (message.length >= 25) {
                await this.world.sleepTicks(1);
            }
        }
    }

    // returns whether or not we died
    damage(damage, player) {
        if (player) {
            const totalDamage = this.playerDamage.get(player.id) || 0;
            this.playerDamage.set(player.id, totalDamage + damage);
        }

        this.skills.hits.current -= damage;

        if (this.skills.hits.current <= 0) {
            this.die();
            return true;
        }

        this.broadcastDamage(damage);
        return false;
    }

    faceDirection(deltaX, deltaY) {
        if (this.isWalking) {
            return this.direction;
        }

        this.isWalking = true;

        const direction = getDirection(deltaX, deltaY);

        if (this.direction === direction) {
            return this.direction;
        }

        this.direction = direction;
        this.broadcastDirection();

        return this.direction;
    }

    // set our direction to face an entity (when we talk to an NPC or pick up
    // a ground item for instance)
    faceEntity(entity) {
        if (this.isWalking) {
            return this.direction;
        }

        this.isWalking = true;

        if (this.x === entity.x && this.y === entity.y) {
            if (entity.direction === 0) {
                this.direction = 0;
            } else if (entity.direction === 1) {
                this.direction = 6;
            }

            return this.direction;
        }

        let deltaX = this.x - entity.x;

        if (deltaX > 0) {
            deltaX = 1;
        } else if (deltaX < 0) {
            deltaX = -1;
        }

        let deltaY = this.y - entity.y;

        if (deltaY > 0) {
            deltaY = 1;
        } else if (deltaY < 0) {
            deltaY = -1;
        }

        const direction = deltaDirections[deltaX + 1][deltaY + 1];

        if (this.direction === direction) {
            return this.direction;
        }

        this.direction = direction;
        this.broadcastDirection();

        return this.direction;
    }

    // face and set our engager to this character, as well as busy status
    engage(character) {
        const { world } = this;

        this.lock();
        this.chasing = null;
        this.interlocutor = character;

        character.lock();
        character.chasing = null;
        character.interlocutor = this;

        const distance = this.getDistance(character);

        // characters don't talk to each other on the same tile, move the
        // interlocutor to a free tile and re-face them
        if (distance === 0) {
            const step = character.getFreeDirection();

            if (step) {
                world.setTickTimeout(() => {
                    character.walkTo(step.deltaX, step.deltaY);

                    world.setTickTimeout(() => {
                        this.faceEntity(character);
                        character.faceEntity(this);
                    }, 2);
                }, 2);
            }
        } else {
            world.setTickTimeout(() => {
                this.faceEntity(character);
                character.faceEntity(this);
            }, 2);
        }
    }

    // free both characters from busy states and conversational partner lock
    disengage() {
        this.unlock();

        if (this.interlocutor) {
            this.interlocutor.unlock();
            this.interlocutor.interlocutor = null;
            this.interlocutor = null;
        }
    }

    async attack(character) {
        if (character.opponent) {
            return false;
        }

        const { world } = this;

        this.toAttack = null;
        this.lock();

        if (this.chasing) {
            this.chasing = null;
        }

        let distance = this.getDistance(character);

        if (distance > 1.5) {
            await this.chase(character, 8, false);
        }

        distance = this.getDistance(character);

        if (character.opponent || distance > 1.5) {
            this.unlock();
            return false;
        }

        if (character.constructor.name === 'Player') {
            character.message('You are under attack!');
        }

        character.lock();
        character.opponent = this;
        character.combatRounds = 0;
        character.fightStage = 1;

        if (character.direction !== 8) {
            if (character.walkQueue) {
                character.walkQueue.length = 0;
            } else {
                character.stepsLeft = 0;
            }

            world.nextTick(() => {
                character.direction = 8;
                character.broadcastDirection();
            });
        }

        const deltaX = character.x - this.x;
        const deltaY = character.y - this.y;

        this.opponent = character;
        this.combatRounds = 0;
        this.fightStage = 0;

        if (deltaX !== 0 || deltaY !== 0) {
            world.setTickTimeout(() => {
                this.walkTo(deltaX, deltaY);

                world.setTickTimeout(() => {
                    this.direction = 9;
                    this.broadcastDirection();
                }, 2);
            }, 2);
        } else {
            world.nextTick(() => {
                this.direction = 9;
                this.broadcastDirection();
            });
        }

        return true;
    }

    async retreat() {
        if (this.fightStage === -1 || this.retreating) {
            return;
        }

        const { world } = this;
        const opponent = this.opponent;

        this.retreating = true;
        this.unlock();
        this.fightStage = -1;

        if (opponent) {
            opponent.unlock();
            opponent.fightStage = -1;

            if (opponent.constructor.name === 'NPC' ) {
                opponent.retreatTicks = 4;
            }
        }

        world.nextTick(() => {
            if (
                this.direction >= 8 &&
                (this.walkQueue ? !this.walkQueue.length : !this.stepsLeft)
            ) {
                this.faceDirection(0, 0);
            }

            if (opponent) {
                if (opponent.direction >= 8) {
                    opponent.faceDirection(0, 0);
                }

                opponent.opponent = null;
                this.opponent = null;
            }

            this.retreating = false;
        });
    }

    // collision detection for players and NPCs to determine if next step is
    // valid
    canWalk(deltaX, deltaY) {
        // if this returns true, the character gets added to the players' moved
        // entity lists, and desyncs from the server by moving an extra tile
        if (deltaX === 0 && deltaY === 0) {
            return false;
        }

        const destX = this.x + deltaX;
        const destY = this.y + deltaY;

        if (
            this.toAttack &&
            this.toAttack.x === destX &&
            this.toAttack.y === destY
        ) {
            return true;
        }

        // attackable? npcs always break our path
        const npcs = this.world.npcs.getAtPoint(destX, destY);

        for (const npc of npcs) {
            if (npc.definition.hostility) {
                return false;
            }
        }

        // we aren't allowed to finish our path on a player (but walking through
        // them is fine)
        if (
            !this.walkAction &&
            (this.stepsLeft === 0 ||
                (this.walkQueue && !this.walkQueue.length)) &&
            (this.world.players.getAtPoint(destX, destY).length ||
                this.world.npcs.getAtPoint(destX, destY).length)
        ) {
            return false;
        }

        return this.world.pathFinder.isValidGameStep(
            { x: this.x, y: this.y },
            { deltaX, deltaY }
        );
    }

    //TODO changeDirection?
    walkTo(deltaX, deltaY) {
        if (this.isWalking) {
            return;
        }

        this.isWalking = true;

        const oldX = this.x;
        const oldY = this.y;

        this.x += deltaX;
        this.y += deltaY;

        this.direction = getDirection(oldX - this.x, oldY - this.y);
        this.broadcastMove();
    }

    getPositionSteps(destX, destY, overlap = true) {
        const { world } = this;

        const steps = [];

        const path = world.pathFinder.getLineOfSight(
            { x: this.x, y: this.y },
            { x: destX, y: destY }
        );

        if (overlap) {
            path.push({ x: destX, y: destY });
        }

        let x = this.x;
        let y = this.y;

        for (const { x: stepX, y: stepY } of path) {
            if (stepX === this.x && stepY === this.y) {
                continue;
            }

            const deltaX = stepX - x;
            const deltaY = stepY - y;

            const validStep = world.pathFinder.isValidGameStep(
                { x, y },
                { deltaX, deltaY }
            );

            if (validStep) {
                steps.push({ deltaX, deltaY });
            } else {
                break;
            }

            x += deltaX;
            y += deltaY;
        }

        return steps;
    }

    async walkToPoint(destX, destY, overlap = true) {
        const { world } = this;
        const steps = this.getPositionSteps(destX, destY, overlap);

        for (const { deltaX, deltaY } of steps) {
            if (
                (this.walkQueue && this.walkQueue.length) ||
                this.stepsLeft > 0
            ) {
                return;
            }

            this.walkTo(deltaX, deltaY);
            await world.sleepTicks(1);
        }
    }

    async chase(entity, range = 8, overlap = false) {
        const { world } = this;

        let ticks = 0;
        this.chasing = entity;

        newSteps: do {
            const destX = this.chasing.x;
            const destY = this.chasing.y;

            const steps = this.getPositionSteps(destX, destY, overlap);

            ticks += 1;

            if (ticks >= 10) {
                break;
            }

            for (const { deltaX, deltaY } of steps) {
                if (ticks >= 10) {
                    break newSteps;
                }

                if (
                    !this.chasing ||
                    (this.walkQueue
                        ? this.walkQueue.length
                        : this.stepsLeft > 0) ||
                    this.chasing.getDistance(this) >= range
                ) {
                    break newSteps;
                }

                if (this.chasing.x !== destX || this.chasing.y !== destY) {
                    continue newSteps;
                }

                if (
                    this.withinWalkBounds &&
                    !this.withinWalkBounds(destX, destY)
                ) {
                    break newSteps;
                }

                if (!overlap && !this.canWalk(deltaX, deltaY)) {
                    break newSteps;
                }

                await world.sleepTicks(1);
                this.walkTo(deltaX, deltaY);

                ticks += 1;
            }
        } while (
            this.chasing &&
            (overlap
                ? this.x !== this.chasing.x || this.y !== this.chasing.y
                : this.getDistance(this.chasing) > 1.5)
        );

        this.chasing = null;
    }

    getFreeDirection() {
        for (let deltaX = -1; deltaX < 2; deltaX += 1) {
            for (let deltaY = -1; deltaY < 2; deltaY += 1) {
                if (deltaX === 0 && deltaY === 0) {
                    continue;
                }

                if (this.canWalk(deltaX, deltaY)) {
                    return { deltaX: deltaX, deltaY: deltaY };
                }
            }
        }
    }

    getCombatExperience() {
        return this.combatLevel * 8 + 80;
    }
}

module.exports = Character;
