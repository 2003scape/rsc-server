const GroundItem = require('./ground-item');
const Item = require('./item');
const items = require('@2003scape/rsc-data/config/items');

const EQUIPMENT_BONUS_NAMES = ['weaponAim', 'weaponPower', 'magic', 'prayer'];

// when is a player's drop visible to other players?
const DROP_OWNER_TIMEOUT = 1000 * 60; // 1 min

// when does a drop disappear entirely?
const DROP_DISAPPEAR_TIMEOUT = 1000 * 60 * 2; // 2 mins

class Inventory {
    constructor(player, items = []) {
        this.player = player;
        this.items = items.map((item) => new Item(item));
    }

    add(id, amount = 1) {
        if (typeof id !== 'number') {
            amount = id.amount;
            id = id.id;
        }

        if (!this.player.world.members && items[id].members) {
            return;
        }

        if (items[id].stackable) {
            for (let i = 0; i < this.items.length; i += 1) {
                const item = this.items[i];

                if (item.id == id) {
                    item.amount += amount;
                    this.sendUpdate(i, item);
                    return;
                }
            }
        }

        if (this.items.length >= 30) {
            this.player.message(
                `Your Inventory is full, the ${items[id].name} drops to ` +
                    'ground!'
            );

            this.drop(id, amount);
        }

        const item = new Item({ id, amount });
        const index = this.items.push(item) - 1;
        this.sendUpdate(index, item);
    }

    has(id, amount = 1) {
        if (typeof id !== 'number') {
            amount = id.amount;
            id = id.id;
        }

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

    remove(id, amount = 1) {
        if (typeof id !== 'number') {
            amount = id.amount;
            id = id.id;
        }

        let foundIndex = -1;

        for (i = 0; i < this.items.length; i += 1) {
            if (this.items[i].id === id) {
                foundItem = i;
                break;
            }
        }

        if (foundIndex > -1) {
            const item = this.items[foundIndex];

            if (item.amount === amount) {
                this.items.splice(foundIndex, 1);
                this.sendRemove(foundIndex);
            } else {
                item.amount -= amount;
                this.sendUpdate(foundIndex, item);
            }
        }
    }

    drop(index) {
        const item = this.items[index];

        if (!item) {
            throw new RangeError(`invalid item index ${index}`);
        }

        this.items.splice(index, 1);
        this.sendRemove(index);

        const groundItem = new GroundItem(this.player.world, {
            ...item,
            x: this.player.x,
            y: this.player.y
        });

        groundItem.owner = this.player.id;

        this.player.world.setTimeout(() => {
            delete groundItem.owner;
        }, DROP_OWNER_TIMEOUT);

        this.player.world.setTimeout(() => {
            this.player.world.removeEntity('groundItems', groundItem);
        }, DROP_DISAPPEAR_TIMEOUT);

        this.player.sendSound('dropobject');
        this.player.world.addEntity('groundItems', groundItem);
    }

    equip(index) {}

    // send the entire inventory contents (used on login and death)
    sendAll() {
        this.player.send({
            type: 'inventoryItems',
            items: this.items.map((item) => {
                if (!item.definition.stackable) {
                    delete item.amount;
                }

                return item;
            })
        });
    }

    sendUpdate(index, { id, amount, equipped }) {
        const message = {
            type: 'inventoryItemUpdate',
            index,
            id,
            amount,
            equipped
        };

        if (!items[id].stackable) {
            delete message.amount;
        }

        this.player.send(message);
    }

    sendRemove(index) {
        this.player.send({ type: 'inventoryItemRemove', index });
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
