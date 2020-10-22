const Item = require('./item');
const shops = require('@2003scape/rsc-data/shops');

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

        this.sellMultiplier = this.definition.sellMultiplier;
        this.buyMultiplier = this.definition.buyMultiplier;

        this.refreshPrices();

        this.boundRestock = this.restock.bind(this);
    }

    refreshPrices() {
        for (let i = 0; i < this.items.length; i += 1) {}
    }

    restock() {
        this.world.setTimeout(this.boundRestock, this.definition.restock);
    }

    buy(player, id, amount) {}

    sell(player, item) {}
}

Shop.names = Object.keys(shops);

module.exports = Shop;
