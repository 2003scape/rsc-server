const Item = require('./item');
const shops = require('@2003scape/rsc-data/shops');

// default to coins as shop currency
const DEFAULT_CURRENCY = 10;

// maximum amount a stack of items can hold
// (per https://classic.runescape.wiki/w/Shop)
const ITEM_STACK_CAPACITY = Math.pow(2, 16) - 1;

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

        this.refreshPrices();

        this.boundRestock = this.restock.bind(this);
    }

    // determines whether or not an item is part of a shop's "regular" inventory
    // returns the object {id, amount} if true, otherwise null
    isShopInventory({ id }) {
        return this.definition.items.find((item) => item.id === id);
    }

    refreshPrices() {
        for (let i = 0; i < this.items.length; i += 1) {}
    }

    // TODO: normalizeStock() seems better since this adds AND removes stock
    restock() {
        let updated = false;

        for (const [index, item] of this.items.entries()) {
            const shopInventory = this.isShopInventory(this, item);

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

        // "re-open" the shop, this refreshes the shop's stock on the client
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

    // note: Shops cannot contain more than 65,535 (2^16 - 1) of a single type
    // of item because of Jagex's use of unsigned 16-bit integers.
    sell(player, id, price) {
        if (!this.occupants.has(player)) {
            return;
        }

        if (!player.inventory.has(id)) {
            // the player doesn't actually have this item.. shame on them
            return;
        }

        const item = { id: id };
        const shopInventory = this.isShopInventory(this, item);

        if (!this.general && !shopInventory) {
            player.message('You cannot sell this item to this shop');
            return;
        }

        // TODO check if price is correct

        player.inventory.remove(id);

        const shopItem = this.items.find((i) => i.id === id);

        if (shopItem) {
            shopItem.amount += 1;
        } else {
            this.items.push(new Item(id));
        }

        player.inventory.add(this.currency, price);

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
