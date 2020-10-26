const Entity = require('./entity');
const items = require('@2003scape/rsc-data/config/items');

class GroundItem extends Entity {
    constructor(world, { id, amount = 1, respawn, x, y }) {
        super(world);

        this.id = id;
        this.amount = amount;
        this.respawn = respawn;
        this.x = x;
        this.y = y;

        this.definition = items[id];

        if (!this.definition) {
            throw new RangeError(`invalid item id ${this.id}`);
        }
    }
}

module.exports = GroundItem;
