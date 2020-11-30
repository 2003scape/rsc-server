const {
    Container, StackPolicy,
    IDComparator, definitionStackable
} = require('./container');

const TRADE_CAPACITY = 12;

function processTradeRequest(playerA, playerB) {
    playerA.trade.requests.delete(playerB);
    playerA.trade.tradingWith = playerB;
    playerA.interfaceOpen.trade = true;
    playerA.send({ type: 'tradeOpen', index: playerB.index });
}

class Trade extends Container {
    constructor(player) {
        super(TRADE_CAPACITY, StackPolicy.USE_FUNCTION, IDComparator,
            definitionStackable);

        // the owner of this object
        this.player = player;

        // set of trade requests the player has received
        this.requests = new Set();

        // the player the owner is trading with
        this.tradingWith = null;
    }

    request(otherPlayer) {
        // TODO: take privacy settings into account

        if (otherPlayer.hasInterfaceOpen()) {
            this.player.message('That player is busy at the moment');
            return;
        }

        // if we have a request from this player, open the trade screen
        // otherwise, send them a trade request
        if (this.requests.has(otherPlayer)) {
            processTradeRequest(this.player);
            processTradeRequest(otherPlayer);
        } else {
            this.player.message('Sending trade request');
            otherPlayer.message(`${this.player.username} wishes to trade with you`);
            otherPlayer.trade.requests.add(this.player);
        }
    }

    accept() { }

    decline() { }

    confirmAccept() { }

    updateItems(items) { }
}

module.exports = Trade;
