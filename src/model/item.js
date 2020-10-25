const items = require('@2003scape/rsc-data/config/items');
const wieldable = require('@2003scape/rsc-data/wieldable');

class Item {
    constructor({ id, amount = 1, equipped = false }) {
        this.id = id;
        this.amount = amount;
        this.equipped = equipped;

        this.definition = items[this.id];

        if (!this.definition) {
            throw new RangeError(`invalid item id: ${this.id}`);
        }

        if (this.definition.equip && wieldable[this.id]) {
            this.definition.wieldable = wieldable[this.id];
        }
    }

    toJSON() {
        const json = { id: this.id };

        if (this.definition.stackable) {
            json.amount = this.amount || 1;
        }

        if (this.equipped) {
            json.equipped = true;
        }

        return json;
    }
}

module.exports = Item;
