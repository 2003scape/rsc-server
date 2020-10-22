const items = require('@2003scape/rsc-data/config/items');
const wieldable = require('@2003scape/rsc-data/wieldable');

class Item {
    constructor({ id, amount }) {
        this.id = id;
        this.amount = amount;

        this.definition = items[this.id];

        if (!this.definition) {
            throw new RangeError(`invalid item id: ${this.id}`);
        }

        if (this.definition.equip && wieldable[this.id]) {
            this.equipmentBonuses = wieldable[this.id];
        }

        this.equipped = false;
    }

    toJSON() {
        return { id: this.id, amount: this.amount };
    }
}

module.exports = Item;
