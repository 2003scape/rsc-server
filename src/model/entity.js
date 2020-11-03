// any type of "thing" within the game world. ground items (but not inventory),
// monsters, players, objects (such as trees), etc.

class Entity {
    constructor(world) {
        this.world = world;
    }

    withinRange(entity, range = 8) {
        let deltaX = entity.x - this.x;
        let deltaY = entity.y - this.y;

        if (deltaY > 0 && Math.abs(deltaY) <= this.height) {
            deltaY = 0;
        }

        if (deltaX > 0 && Math.abs(deltaX) <= this.width) {
            deltaX = 0;
        }

        if (Math.abs(deltaX) > (range / 2) || Math.abs(deltaY) > (range / 2)) {
            return false;
        }

        return true;
    }

    // used for trading/dueling
    withinLineOfSight(entity, distance = 4) {
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
}

module.exports = Entity;
