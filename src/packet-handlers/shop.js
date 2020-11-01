function shopOpen(player) {
    if (!player.interfaceOpen.shop || !player.shop) {
        // should we close shop interface?
        player.exitShop();
        return false;
    }

    return true;
}

async function shopBuy({ player }, { id, price }) {
    if (!shopOpen(player)) {
        return;
    }

    player.shop.buy(player, id, price);
}

async function shopSell({ player }, { id, price }) {
    if (!shopOpen(player)) {
        return;
    }

    player.shop.sell(player, id, price);
}

async function shopClose({ player }) {
    if (!player.interfaceOpen.shop) {
        return;
    }

    player.exitShop(false);
    player.unlock();
}

module.exports = { shopBuy, shopSell, shopClose };
