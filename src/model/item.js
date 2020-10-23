const items = require('@2003scape/rsc-data/config/items');
const wieldable = require('@2003scape/rsc-data/wieldable');

class Item {
    constructor({ id, amount, equipped = false }) {
        this.id = id;
        this.amount = amount;
        this.equipped = equipped;

        this.definition = items[this.id];

        if (!this.definition) {
            throw new RangeError(`invalid item id: ${this.id}`);
        }

        if (this.definition.equip && wieldable[this.id]) {
            this.wieldable = wieldable[this.id];
        }
    }

    toJSON() {
        return { id: this.id, amount: this.amount, equipped: this.equipped };
    }
}

module.exports = Item;
