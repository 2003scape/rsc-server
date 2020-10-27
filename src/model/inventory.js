const GroundItem = require('./ground-item');
const Item = require('./item');
const items = require('@2003scape/rsc-data/config/items');

const EQUIPMENT_BONUS_NAMES = [
    'armour',
    'weaponAim',
    'weaponPower',
    'magic',
    'prayer'
];

// character.animations index for each type of equipable item (order is
// important)
const EQUIPMENT_ANIMATION_INDEXES = [
    { type: 'replace-head', index: 0 },
    { type: 'replace-body', index: 1 },
    { type: 'replace-legs', index: 2 },
    { type: '2-handed', index: 4 },
    { type: 'left-hand', index: 3 },
    { type: 'right-hand', index: 4 },
    { type: 'head', index: 5 },
    { type: 'body', index: 6 },
    { type: 'legs', index: 7 },
    { type: 'hands', index: 8 },
    { type: 'feet', index: 9 },
    { type: 'chest', index: 10 },
    { type: 'cape', index: 11 }
];

// get the correct player animation index for different equip types
function getAnimationIndex(equip) {
    for (const { type, index } of EQUIPMENT_ANIMATION_INDEXES) {
        if (equip.indexOf(type) > -1) {
            return index;
        }
    }

    throw new Error(`unable to find animation index for ${equip}`);
}

class Inventory {
    constructor(player, items = []) {
        this.player = player;
        this.items = items.map((item) => new Item(item));

        // { type: inventoryIndex }
        this.equipmentSlots = {
            '2-handed': -1,
            'replace-head': -1,
            'replace-body': -1,
            'replace-legs': -1,
            'right-hand': -1,
            'left-hand': -1,
            head: -1,
            body: -1,
            legs: -1,
            hands: -1,
            feet: -1,
            chest: -1,
            cape: -1
        };
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

            this.player.world.addPlayerDrop(this.player, { id, amount });
            return;
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

        for (let i = 0; i < this.items.length; i += 1) {
            if (this.items[i].id === id) {
                foundIndex = i;
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

        if (item.equipped) {
            this.unequip(index);
        }

        this.items.splice(index, 1);

        for (const type of Object.keys(this.equipmentSlots)) {
            if (this.equipmentSlots[type] > index) {
                this.equipmentSlots[type] -= 1;
            }
        }

        this.player.world.addPlayerDrop(this.player, item);

        this.sendRemove(index);
    }

    unequip(index) {
        const item = this.items[index];

        if (!item) {
            throw new RangeError(`invalid item index ${index}`);
        }

        if (!item.equipped) {
            throw new Error(`item index ${index} not equipped`);
        }

        for (const type of item.definition.equip) {
            this.equipmentSlots[type] = -1;
        }

        const animationIndex = getAnimationIndex(item.definition.equip);

        if (animationIndex === 0) {
            this.player.animations[0] = this.player.appearance.headSprite;
        } else if (animationIndex === 1) {
            this.player.animations[1] = this.player.appearance.bodySprite;
        } else if (animationIndex === 2) {
            this.player.animations[2] = 3;
        } else {
            this.player.animations[animationIndex] = 0;
        }

        item.equipped = false;
        this.sendUpdate(index, item);

        this.updateEquipmentBonuses();
        this.player.sendEquipmentBonuses();

        this.player.localEntities.characterUpdates.playerAppearances.push(
            this.player.formatAppearanceUpdate()
        );
        this.player.broadcastPlayerAppearance();
    }

    equip(index) {
        const item = this.items[index];

        if (!item) {
            throw new RangeError(`invalid item index ${index}`);
        }

        if (!item.definition.wieldable) {
            // https://classic.runescape.wiki/w/Knife_bug
            throw new RangeError(`equipping unequipable item index ${index}`);
        }

        for (const type of item.definition.equip) {
            const equippedIndex = this.equipmentSlots[type];

            if (equippedIndex !== -1) {
                this.unequip(equippedIndex);
            }

            this.equipmentSlots[type] = index;
        }

        const animationIndex = getAnimationIndex(item.definition.equip);
        this.player.animations[animationIndex] =
            item.definition.wieldable.animation;

        item.equipped = true;
        this.sendUpdate(index, item);

        this.updateEquipmentBonuses();
        this.player.sendEquipmentBonuses();

        this.player.localEntities.characterUpdates.playerAppearances.push(
            this.player.formatAppearanceUpdate()
        );
        this.player.broadcastPlayerAppearance();
    }

    updateEquipmentSlots() {
        for (let i = 0; i < this.items.length; i += 1) {
            const item = this.items[i];

            if (!item.equipped) {
                continue;
            }

            for (const type of item.definition.equip) {
                this.equipmentSlots[type] = i;
            }

            const animationIndex = getAnimationIndex(item.definition.equip);
            this.player.animations[animationIndex] =
                item.definition.wieldable.animation;
        }
    }

    updateEquipmentBonuses() {
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

        this.player.equipmentBonuses = equipmentBonuses;
    }

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

    // used for adding a single item, or changing its amount/equip status
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

    toJSON() {
        return this.items;
    }
}

module.exports = Inventory;
