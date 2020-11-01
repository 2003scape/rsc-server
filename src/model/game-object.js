const Entity = require('./entity');
const objects = require('@2003scape/rsc-data/config/objects');

class GameObject extends Entity {
    constructor(world, { id, direction, x, y }) {
        super(world);

        this.id = id;
        this.direction = direction;
        this.x = x;
        this.y = y;

        this.definition = objects[this.id];

        if (!this.definition) {
            throw new RangeError(`invalid GameObject id ${this.id}`);
        }

        this.width = this.definition.width;
        this.height = this.definition.height;

        if (this.direction === 2 || this.direction === 6) {
            [this.width, this.height] = [this.height, this.width];
        }
    }
}

module.exports = GameObject;
