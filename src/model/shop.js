const Item = require('./item');
const shops = require('@2003scape/rsc-data/shops');

// default to coins as shop currency
const DEFAULT_CURRENCY = 10;

// maximum amount a stack of items can hold
// (per https://classic.runescape.wiki/w/Shop)
const ITEM_STACK_CAPACITY = Math.pow(2, 16) - 1;

// maximum number of items a shop can hold
const ITEM_CAPACITY = 40;

function getMinimumSellPrice(item) {
    return Math.floor(item.definition.price * 0.1);
}

function getMinimumBuyPrice(item) {
    return Math.floor(item.definition.price * 0.3);
}

class Shop {
    constructor(world, name) {
        this.world = world;
        this.name = name;

        this.definition = shops[name];

        if (!this.definition) {
            throw new Error(`invalid shop name: "${this.name}"`);
        }

        // players viewing the shop
        this.occupants = new Set();

        // the items being sold and current prices
        this.items = this.definition.items
            .slice()
            .map((item) => new Item(item));

        this.general = this.definition.general;
        this.sellMultiplier = this.definition.sellMultiplier;
        this.buyMultiplier = this.definition.buyMultiplier;
        this.currency = this.definition.currency || DEFAULT_CURRENCY;

        this.updateTimeout = null;

        this.boundRestock = this.restock.bind(this);
    }

    // determines whether or not an item is part of a shop's "regular" inventory
    // returns the object {id, amount} if true, otherwise null
    getShopInventory({ id }) {
        return this.definition.items.find((item) => item.id === id);
    }

    getItemPrice(item, isSelling) {
        const shopItem = this.getShopInventory(item) || { amount: -2 };
        const equilibrium = shopItem.amount;

        const percent = equilibrium > 100 ? 0.01 : 0.05;

        const value = {
            min: item.definition.price / 4,
            max: item.definition.price * 2
        };

        let price = item.definition.price;

        if (isSelling) {
            price *= 0.5;
            if (item.amount > equilibrium) {
                price -= Math.floor(
                    price * (percent * (item.amount - equilibrium))
                );
            }
        } else {
            // is buying
            if (item.amount < equilibrium) {
                price += Math.floor(
                    price * (percent * (equilibrium - item.amount))
                );
            }
        }

        if (price > value.max) {
            price = value.max;
        } else if (price < value.min) {
            price = value.min;
        }

        if (price === 0 && !isSelling) {
            // minimum buying price of 1
            return 1;
        }

        return price;
    }

    getItemDeltaPrice(item) {
        const shopItem = this.getShopInventory(item);
        let stockAmount = 0;

        if (shopItem) {
            stockAmount = shopItem.amount;
        }

        return (stockAmount - item.amount) * this.definition.delta;
    }

    // TODO: normalizeStock() seems better since this adds AND removes stock
    restock() {
        let updated = false;

        for (const [index, item] of this.items.entries()) {
            const shopInventory = this.getShopInventory(item);

            if (shopInventory) {
                // regular shop item
                if (item.amount > shopInventory.amount) {
                    item.amount -= 1;
                    updated = true;
                } else if (item.amount < shopInventory.amount) {
                    item.amount += 1;
                    updated = true;
                }
            } else {
                // non-shop item, decrease its amount by one
                if (item.amount <= 1) {
                    // remove the item if theres 1 or less
                    this.items = this.items.splice(index, 1);
                } else {
                    item.amount -= 1;
                }

                updated = true;
            }
        }

        if (updated) {
            this.updateOccupants();
        }

        this.world.setTimeout(this.boundRestock, this.definition.restock);
    }

    updateOccupants() {
        for (const occupant of this.occupants) {
            occupant.openShop(this.name);
        }
    }

    buy(player, id, price) {
        if (!this.occupants.has(player)) {
            return;
        }
    }

    sell(player, id, price) {
        if (!this.occupants.has(player)) {
            return;
        }

        if (!player.inventory.has(id)) {
            // the player doesn't actually have this item.. shame on them
            return;
        }

        const item = new Item({ id });
        const shopInventory = this.getShopInventory(item);

        if (!this.general && !shopInventory) {
            player.message('You cannot sell this item to this shop');
            return;
        }

        // TODO check if price is correct
        player.message(`sell price: ${this.getItemPrice(item, true)}`);

        const shopItem = this.items.find((i) => i.id === id);

        if (shopItem) {
            // the shop has this item, now check if the shop's capcity has
            // been met
            if (shopItem.amount < ITEM_STACK_CAPACITY) {
                shopItem.amount += 1;
            } else {
                // NOT KOSHER
                player.message('This shop has enough of that item');
                return;
            }
        } else {
            // shop doesn't already contain the item, check if the shop can
            // hold new items
            if (this.items.length < ITEM_CAPACITY) {
                this.items.push(new Item({ id }));
            } else {
                player.message('This shop is full');
                return;
            }
        }

        player.inventory.remove(id);
        player.inventory.add(this.currency, price);

        // start a timer to update the shops occupants on the next game tick
        if (this.updateTimeout) {
            this.world.clearTickTimeout(this.updateTimeout);
        }

        this.updateTimeout = this.world.nextTick(() => {
            this.updateOccupants();
            this.updateTimeout = null;
        });
    }
}

Shop.names = Object.keys(shops);

module.exports = Shop;
