const Item = require('./item');
const items = require('@2003scape/rsc-data/config/items');

class Inventory {
    constructor(player, items = []) {
        this.player = player;
        this.items = items.map((item) => new Item(item));
    }

    has(id, amount = 1) {
        if (!this.player.world.members && items[id].members) {
            return false;
        }
    }

    toJSON() {
        return this.items;
    }
}

module.exports = Inventory;
