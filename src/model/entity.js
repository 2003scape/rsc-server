// any type of "thing" within the game world. ground items (but not inventory),
// monsters, players, objects (such as trees), etc.

class Entity {
    constructor(world) {
        this.world = world;
    }

    withinRange(entity, range = 8) {
        /*if (
            Math.abs(entity.x - this.x) > (range / 2) ||
            Math.abs(entity.y - this.y) > (range / 2)
        ) {
            return false;
        }*/

        //return true;

        var distance = Math.sqrt(
            Math.pow(entity.x - this.x, 2) + Math.pow(entity.y - this.y, 2)
        );

        return distance <= range / 2;
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
            .filter((entity) => {
                return entity !== this;
            });
    }
}

module.exports = Entity;
