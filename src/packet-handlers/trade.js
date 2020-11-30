async function playerTrade({ player }, { index }) {
    const { world } = player;

    if (player.index === index) {
        throw new RangeError(`${player} trading with self`);
    }

    const otherPlayer = world.players.getByIndex(index);

    if (!otherPlayer) {
        throw new RangeError(
            `${player} tried to trade with invalid player index ${index}`
        );
    }

    if (!player.withinRange(otherPlayer, 8, true)) {
        player.message("I'm not near enough");
        return;
    }

    if (!player.withinLineOfSight(otherPlayer)) {
        player.message('There is an obstacle in the way');
        return;
    }

    player.trade.request(otherPlayer);
}

async function tradeAccept({ player }) {
    player.trade.accept();
}

async function tradeConfirmAccept({ player }) {
    player.trade.confirmAccept();
}

async function tradeDecline({ player }) {
    player.trade.decline();
}

async function tradeItemUpdate({ player }, { items }) {
    player.trade.updateItems(items);
}

module.exports = {
    playerTrade, tradeAccept, tradeConfirmAccept, tradeDecline, tradeItemUpdate
};
