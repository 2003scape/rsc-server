// any type of "thing" within the game world. ground items (but not inventory),
// monsters, players, objects (such as trees), etc.

const regions = require('@2003scape/rsc-data/regions');
const wallObjects = require('@2003scape/rsc-data/config/wall-objects');

// walls that projectiles can pass through
const PROJECTILE_WALLS = new Set([
    'fence',
    'arrowslit',
    'web',
    'railing',
    'low wall'
]);

// partial object model names that projectiles can pass through
const PROJECTILE_MODELS = new Set([
    'bed',
    'bench',
    'bone',
    'brokenpillar',
    'bush',
    'chair',
    'egg',
    'fence',
    'gate',
    'gravestone',
    'ladder',
    'logpile',
    'railing',
    'rock',
    'sign',
    'skull',
    'table',
    'throne',
    'torch',
    'treestump'
]);

function isWallBlocked(wallObjectID) {
    if (typeof wallObjectID !== 'number') {
        return false;
    }

    wallObjectID -= 1;

    const wallObject = wallObjects[wallObjectID];

    if (!wallObject.blocked) {
        return false;
    }

    const name = wallObject.name.toLowerCase();

    for (const wallSegment of PROJECTILE_WALLS) {
        if (name.indexOf(wallSegment) > -1) {
            return false;
        }
    }

    return true;
}

function getTileWall(world, x, y) {
    return world.landscape.getTileAtGameCoords(x, y).wall;
}

function isProjectileBlocked(world, { x, y }, { deltaX, deltaY }) {
    if (deltaX !== 0 && deltaY !== 0) {
        const diagonal = getTileWall(world, x, y).diagonal;

        if (diagonal && isWallBlocked(diagonal.overlay)) {
            return true;
        }
    }

    if (deltaY === -1 && isWallBlocked(getTileWall(world, x, y).horizontal)) {
        return true;
    }

    if (
        deltaY === 1 &&
        isWallBlocked(getTileWall(world, x, y + 1).horizontal)
    ) {
        return true;
    }

    if (deltaX === -1 && isWallBlocked(getTileWall(world, x, y).vertical)) {
        return true;
    }

    if (deltaX === 1 && isWallBlocked(getTileWall(world, x + 1, y).vertical)) {
        return true;
    }
}

class Entity {
    constructor(world) {
        this.world = world;
    }

    withinRange(entity, range = 8, precise = false) {
        let deltaX = entity.x - this.x;
        let deltaY = entity.y - this.y;

        // some objects take up multiple squares
        if (deltaY > 0 && Math.abs(deltaY) <= this.height) {
            deltaY = 0;
        }

        if (deltaX > 0 && Math.abs(deltaX) <= this.width) {
            deltaX = 0;
        }

        if (precise) {
            // no need to sqrt unless we needed the distance. big optimizations
            if (
                Math.pow(deltaX, 2) + Math.pow(deltaY, 2) >
                Math.pow(range / 2, 2)
            ) {
                return false;
            }

            return true;
        }

        // this is good enough for entities within view
        if (Math.abs(deltaX) > range / 2 || Math.abs(deltaY) > range / 2) {
            return false;
        }

        return true;
    }

    // used for trading/dueling
    withinLineOfSight(entity, projectile = false) {
        const path = this.world.pathFinder.getLineOfSight(
            { x: this.x, y: this.y },
            { x: entity.x, y: entity.y }
        );

        path.push({ x: entity.x, y: entity.y });

        let x = this.x;
        let y = this.y;

        let gameObjects;

        if (projectile) {
            gameObjects = this.world.gameObjects.getInArea(x, y, 8).filter(
                ({
                    definition: {
                        type,
                        model: { name: modelName }
                    }
                }) => {
                    if (type === 'unblocked' || type === 'open-door') {
                        return false;
                    }

                    modelName = modelName.toLowerCase();

                    for (const modelSegment of PROJECTILE_MODELS) {
                        if (modelName.indexOf(modelSegment) > -1) {
                            return false;
                        }
                    }

                    return true;
                }
            );
        }

        for (const { x: stepX, y: stepY } of path) {
            if (stepX === this.x && stepY === this.y) {
                continue;
            }

            const deltaX = stepX - x;
            const deltaY = stepY - y;

            if (projectile) {
                if (
                    isProjectileBlocked(
                        this.world,
                        { x, y },
                        { deltaX, deltaY }
                    )
                ) {
                    return false;
                }

                for (const {
                    x: objectX,
                    y: objectY,
                    width,
                    height
                } of gameObjects) {
                    if (
                        stepX <= objectX + width - 1 &&
                        stepX >= objectX &&
                        stepY <= objectY + height - 1 &&
                        stepY >= objectY
                    ) {
                        return false;
                    }
                }
            } else {
                if (
                    !this.world.pathFinder.isValidGameStep(
                        { x, y },
                        { deltaX, deltaY }
                    )
                ) {
                    return false;
                }
            }

            x += deltaX;
            y += deltaY;
        }

        return true;
    }

    getDistance(entity) {
        return Math.sqrt(
            Math.pow(entity.x - this.x, 2) + Math.pow(entity.y - this.y, 2)
        );
    }

    // get the x, y offsets of an entity relative to this one
    getEntityOffsets(entity) {
        return {
            offsetX: entity.x - this.x,
            offsetY: entity.y - this.y
        };
    }

    // get all of the nearby entities of certain type
    getNearbyEntities(type, range = 48) {
        return this.world[type]
            .getInArea(this.x, this.y, range)
            .filter((entity) => entity !== this);
    }

    getNearbyEntitiesByID(type, id, range = 48) {
        return this.getNearbyEntities(type, range).filter(
            (entity) => entity.id === id
        );
    }

    getNearestEntityByID(type, id, range = 48) {
        const nearbyEntities = this.getNearbyEntitiesByID(type, id, range);

        return nearbyEntities.sort(
            (entity1, entity2) =>
                this.getDistance(entity1) - this.getDistance(entity2)
        )[0];
    }

    withinRegion(name, multiplePlanes = true) {
        const region = regions[name];

        if (!region) {
            throw new Error(`invalid region name ${name}`);
        }

        const x = this.x;
        let y = this.y;

        if (multiplePlanes) {
            y %= this.world.planeElevation;
        }

        return (
            x >= region.minX &&
            x <= region.maxY &&
            y >= region.minY &&
            y <= region.maxY
        );
    }
}

module.exports = Entity;
