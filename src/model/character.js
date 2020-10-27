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

// used for the collision detection
function getObstacle(pathFinder, gameX, gameY, offsetX, offsetY) {
    const {
        x: obstacleX,
        y: obstacleY
    } = pathFinder.gameCoordsToObstacleCoords({
        x: gameX,
        y: gameY
    });

    return pathFinder.obstacles.get(obstacleX + offsetX, obstacleY + offsetY);
}

class Character extends Entity {
    constructor(world) {
        super(world);

        // direction number we're facing
        this.direction = 0;

        // the character we're fighting
        this.opponent = null;

        // the character we're talking to
        this.interlocutor = null;

        // can we move? certain NPCs still have conversation partners, but can
        // walk around (e.g. goblin generals in goblin diplomacy)
        this.locked = false;

        // animation IDs
        // see https://github.com/2003scape/rsc-config#configanimations
        this.animations = [];
        this.animations.length = 12;
        this.animations.fill(0, this.animations.length);
    }

    lock() {
        this.locked = true;
    }

    unlock() {
        this.locked = false;
    }

    faceDirection(deltaX, deltaY) {
        if (deltaX === 0 && deltaY === 0) {
            return this.direction;
        }

        this.direction = deltaDirections[deltaX + 1][deltaY + 1];
        return this.direction;
    }

    // set our direction to face character
    faceCharacter(character) {
    }

    // face and set our engager to this character, as well as busy status
    engage(character) {
        this.lock();
        character.lock();

        this.interlocutor = character;
        character.interlocutor = this;
    }

    // free both characters from busy states and conversational partner lock
    disengage() {
        this.unlock();

        if (this.interlocutor) {
            this.interlocutor.unlock();
        }
    }

    walkTo(deltaX, deltaY) {
        const oldX = this.x;
        const oldY = this.y;

        this.x += deltaX;
        this.y += deltaY;

        this.faceDirection(oldX - this.x, oldY - this.y);
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

        // npcs always break our path
        if (this.world.npcs.getAtPoint(destX, destY).length) {
            return false;
        }

        const pathFinder = this.world.pathFinder;

        const {
            x: obstacleX,
            y: obstacleY
        } = pathFinder.gameCoordsToObstacleCoords({
            x: destX,
            y: destY
        });

        if (
            pathFinder.obstacles.get(obstacleX, obstacleY) &&
            pathFinder.obstacles.get(obstacleX + 1, obstacleY) &&
            pathFinder.obstacles.get(obstacleX, obstacleY + 1) &&
            pathFinder.obstacles.get(obstacleX + 1, obstacleY + 1)
        ) {
            return false;
        }

        if (deltaX === 0 && deltaY === -1) {
            // north
            if (getObstacle(pathFinder, this.x, this.y, 0, 0)) {
                return false;
            }
        } else if (deltaX === 1 && deltaY === -1) {
            // northwest
            if (
                getObstacle(pathFinder, this.x, this.y, 0, 0) ||
                getObstacle(pathFinder, destX, this.y, 1, 0) ||
                getObstacle(pathFinder, destX, destY, 1, 1)
            ) {
                return false;
            }
        } else if (deltaX === 1 && deltaY === 0) {
            // west
            if (getObstacle(pathFinder, destX, this.y, 1, 1)) {
                return false;
            }
        } else if (deltaX === 1 && deltaY === 1) {
            // southwest
            if (
                getObstacle(pathFinder, this.x, destY, 0, 0) ||
                getObstacle(pathFinder, destX, this.y, 1, 1) ||
                getObstacle(pathFinder, destX, destY, 1, 0)
            ) {
                return false;
            }
        } else if (deltaX === 0 && deltaY === 1) {
            // south
            if (getObstacle(pathFinder, destX, destY, 0, 0)) {
                return false;
            }
        } else if (deltaX === -1 && deltaY === 1) {
            // southeast
            if (
                getObstacle(pathFinder, this.x, this.y, 1, 1) ||
                getObstacle(pathFinder, this.x, destY, 1, 0) ||
                getObstacle(pathFinder, destX, destY, 1, 1)
            ) {
                return false;
            }
        } else if (deltaX === -1 && deltaY === 0) {
            // east
            if (getObstacle(pathFinder, this.x, this.y, 1, 1)) {
                return false;
            }
        } else if (deltaX === -1 && deltaY === -1) {
            // northeast
            if (
                getObstacle(pathFinder, this.x, this.y, 1, 0) ||
                getObstacle(pathFinder, this.x, destY, 1, 1) ||
                getObstacle(pathFinder, destX, this.y, 0, 0)
            ) {
                return false;
            }
        }

        return true;
    }

    getElevation() {
        return Math.floor(this.y / this.world.planeElevation);
    }
}

module.exports = Character;