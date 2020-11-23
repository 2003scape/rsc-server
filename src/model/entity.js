// any type of "thing" within the game world. ground items (but not inventory),
// monsters, players, objects (such as trees), etc.

const regions = require('@2003scape/rsc-data/regions');

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
    withinLineOfSight(entity) {
        const path = this.world.pathFinder.getLineOfSight(
            { x: this.x, y: this.y },
            { x: entity.x, y: entity.y }
        );

        let x = this.x;
        let y = this.y;

        for (const { x: stepX, y: stepY } of path) {
            if (stepX === this.x && stepY === this.y) {
                continue;
            }

            const deltaX = stepX - x;
            const deltaY = stepY - y;

            if (
                !this.world.pathFinder.isValidGameStep(
                    { x, y },
                    { deltaX, deltaY }
                )
            ) {
                return false;
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
            entity => entity.id === id
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
