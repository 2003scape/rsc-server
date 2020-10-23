const Item = require('./item');
const items = require('@2003scape/rsc-data/config/items');

const EQUIPMENT_BONUS_NAMES = ['weaponAim', 'weaponPower', 'magic', 'prayer'];

class Inventory {
    constructor(player, items = []) {
        this.player = player;
        this.items = items.map((item) => new Item(item));
    }

    add({ id, amount }) {
    }

    has({ id, amount = 1 }) {
        if (!this.player.world.members && items[id].members) {
            return false;
        }

        for (const item of this.items) {
            if (item.id === id && item.amount >= amount) {
                return true;
            }
        }

        return false;
    }

    remove({ id, amount = 1 }) {
        let foundItem = false;
        let i;

        for (i = 0; i < this.items.length; i += 1) {
            if (this.items[i].id === id) {
                foundItem = true;
                break;
            }
        }

        if (foundItem) {
            const item = this.items[i];

            if (item.amount === amount) {
                this.items.splice(i, 1);
                this.send();
            } else {
                item.amount -= amount;
                this.update(i, item);
            }
        } else {
            throw new RangeError('trying to remove non-existent item');
        }
    }

    equip() {
    }

    // send the entire inventory contents (used on login and death)
    send() {
        this.player.send({
            type: 'inventoryItems',
            items: this.items
        });
    }

    update(index, { id, amount, equipped }) {
        this.player.send({
            type: 'inventoryItemUpdate',
            index,
            id,
            amount,
            equipped
        });
    }

    getEquipmentBonuses() {
        const equipmentBonuses = {};

        for (const item of this.items) {
            if (item.equipped && item.definition.wieldable) {
                for (const bonus of EQUIPMENT_BONUS_NAMES) {
                    equipmentBonuses[bonus] =
                        (equipmentBonuses[bonus] || 0) +
                        item.definition.wieldable[bonus];
                }
            }
        }

        return equipmentBonuses;
    }

    toJSON() {
        return this.items;
    }
}

module.exports = Inventory;
