const Item = require('./item');
const items = require('@2003scape/rsc-data/config/items');
const { formatSkillName } = require('../skills');

const {
    ammunition,
    weapons: rangedWeapons
} = require('@2003scape/rsc-data/ranged');

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

const CROSSBOW_ID = 60;
const PHOENIX_CROSSBOW_ID = 59;

const BOLT_IDS = new Set(rangedWeapons[CROSSBOW_ID].ammunition);
const ARROW_IDS = new Set(Object.keys(ammunition).map(Number));

for (const boltID of BOLT_IDS) {
    ARROW_IDS.delete(boltID);
}

// get the correct player animation index for different equip types
function getAnimationIndex(equip) {
    for (const { type, index } of EQUIPMENT_ANIMATION_INDEXES) {
        if (equip.indexOf(type) > -1) {
            return index;
        }
    }

    throw new RangeError(`unable to find animation index for ${equip}`);
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

        if (this.isFull()) {
            this.player.message(
                `Your Inventory is full, the ${items[id].name} drops to ` +
                    'ground!'
            );

            this.player.world.addPlayerDrop(this.player, { id, amount });
            this.player.sendSound('dropobject');
            return;
        }

        const item = new Item({ id, amount });
        const index = this.items.push(item) - 1;

        this.sendUpdate(index, item);

        if (!items[id].stackable && amount > 1) {
            this.add(id, amount - 1);
        }
    }

    has(id, amount = 1) {
        if (typeof id !== 'number') {
            amount = id.amount;
            id = id.id;
        }

        if (!this.player.world.members && items[id].members) {
            return false;
        }

        let inventoryAmount = 0;
        const stackable = items[id].stackable;

        for (const item of this.items) {
            if (item.id === id) {
                if (stackable && item.amount >= amount) {
                    return true;
                } else {
                    inventoryAmount += 1;
                }
            }
        }

        if (inventoryAmount >= amount) {
            return true;
        }

        return false;
    }

    remove(id, amount = 1) {
        if (typeof id !== 'number') {
            amount = id.amount;
            id = id.id;
        }

        let foundIndex = -1;

        for (let i = this.items.length - 1; i >= 0; i -= 1) {
            if (this.items[i].id === id) {
                foundIndex = i;
                break;
            }
        }

        if (foundIndex > -1) {
            const item = this.items[foundIndex];

            if (item.equipped) {
                this.unequip(foundIndex);
            }

            if (!item.definition.stackable || item.amount === amount) {
                this.items.splice(foundIndex, 1);
                this.updateEquipmentIndexes(foundIndex);
                this.sendRemove(foundIndex);

                amount -= 1;

                if (amount > 0) {
                    this.remove(id, amount);
                }
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
        this.updateEquipmentIndexes(index);

        this.player.world.addPlayerDrop(this.player, item);
        this.player.sendSound('dropobject');

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
        this.player.broadcastPlayerAppearance(true);
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

        const { requirements } = item.definition.wieldable;

        if (requirements) {
            for (const [skillName, level] of Object.entries(requirements)) {
                if (this.player.skills[skillName].base < level) {
                    this.player.message(
                        'You are not a high enough level to use this item',
                        `You need to have a ${formatSkillName(skillName)} ` +
                            `level of ${level}`
                    );

                    return;
                }
            }
        }

        if (item.definition.wieldable.female && this.player.isMale()) {
            this.player.message(
                "It doesn't fit!",
                'Perhaps I should get someone to adjust it for me'
            );

            return;
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
        this.player.broadcastPlayerAppearance(true);
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
        for (const bonus of EQUIPMENT_BONUS_NAMES) {
            this.player.equipmentBonuses[bonus] = 1;
        }

        for (const item of this.items) {
            if (item.equipped && item.definition.wieldable) {
                for (const bonus of EQUIPMENT_BONUS_NAMES) {
                    this.player.equipmentBonuses[bonus] +=
                        item.definition.wieldable[bonus];
                }
            }
        }

        this.player.sendEquipmentBonuses();
    }

    // when we remove an item from the inventory
    updateEquipmentIndexes(fromIndex) {
        for (const type of Object.keys(this.equipmentSlots)) {
            if (this.equipmentSlots[type] > fromIndex) {
                this.equipmentSlots[type] -= 1;
            }
        }
    }

    // send the entire inventory contents (used on login and death)
    sendAll() {
        this.player.send({
            type: 'inventoryItems',
            items: this.items.map((item) => {
                const i = { ...item };

                if (!item.definition.stackable) {
                    delete i.amount;
                }

                return i;
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

    // remove and return the 3-4 most valuable items on death
    removeMostValuable(amount = 3) {
        for (const [index, item] of this.items.entries()) {
            if (item.equipped) {
                this.unequip(index);
            }
        }

        return this.items
            .sort((a, b) => {
                if (a.definition.price > b.definition.price) {
                    return -1;
                } else if (b.definition.price < a.definition.price) {
                    return 1;
                }

                return 0;
            })
            .slice(0, amount)
            .map((item) => {
                if (item.definition.stackable && item.amount > 1) {
                    item.amount -= 1;
                } else {
                    this.items.splice(this.items.indexOf(item), 1);
                }

                return new Item({ id: item.id });
            });
    }

    isEquipped(id) {
        if (typeof id !== 'number') {
            id = id.id;
        }

        if (!this.has(id)) {
            return false;
        }

        for (const index of Object.values(this.equipmentSlots)) {
            if (index < 0) {
                continue;
            }

            const item = this.items[index];

            if (item.id === id) {
                return true;
            }
        }

        return false;
    }

    getRangedWeapon() {
        const index = this.equipmentSlots['right-hand'];

        if (index < 0) {
            return;
        }

        const item = this.items[index];

        if (rangedWeapons[item.id]) {
            return item;
        }
    }

    // check if the player has the correct ammunition type for the bow they're
    // using, give them a message if not. return undefined if no ammunition
    // found
    getAmmunitionID(messages = true) {
        const equippedItem = this.items[this.equipmentSlots['right-hand']];

        for (const ammunitionID of rangedWeapons[equippedItem.id].ammunition) {
            if (this.has(ammunitionID)) {
                return ammunitionID;
            }
        }

        const crossbowEquipped = equippedItem
            ? equippedItem.id === PHOENIX_CROSSBOW_ID ||
              equippedItem.id === CROSSBOW_ID
            : false;

        if (crossbowEquipped) {
            for (const arrowID of ARROW_IDS) {
                if (this.has(arrowID)) {
                    if (messages) {
                        this.player.message(
                            "You can't fire arrows with a crossbow"
                        );
                    }

                    return -1;
                }
            }
        } else {
            for (const boltID of BOLT_IDS) {
                if (this.has(boltID)) {
                    if (messages) {
                        this.player.message("You can't fire bolts with a bow");
                    }

                    return -1;
                }
            }

            for (const arrowID of ARROW_IDS) {
                if (this.has(arrowID)) {
                    if (messages) {
                        this.player.message(
                            'Your ammo is too powerful for your bow'
                        );
                    }

                    return -1;
                }
            }
        }

        if (messages) {
            this.player.message("You don't have enough ammo in your quiver");
        }

        return -1;
    }

    isFull() {
        return this.items.length >= 30;
    }

    toJSON() {
        return this.items;
    }
}

module.exports = Inventory;
