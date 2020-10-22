const Entity = require('./entity');
const wallObjects = require('@2003scape/rsc-data/config/wall-objects');

class WallObject extends Entity {
    constructor(world, { id, direction, x, y }) {
        super(world);

        this.id = id;
        this.direction = direction;
        this.x = x;
        this.y = y;

        this.definition = wallObjects[this.id];

        if (!this.definition) {
            throw new RangeError(`invalid WallObject id ${this.id}`);
        }
    }
}

module.exports = WallObject;
