const {
    Container,
    StackPolicy,
    IDComparator,
    definitionStackable
} = require('./container');

const TRADE_CAPACITY = 12;

function processTradeRequest(playerA, playerB) {
    playerA.trade.requests.delete(playerB);
    playerA.trade.tradingWith = playerB;
    playerA.interfaceOpen.trade = true;
    playerA.send({ type: 'tradeOpen', index: playerB.index });
}

function processTradeClose(player) {
    player.interfaceOpen.trade = false;
    player.trade.tradingWith = null;
    player.trade.clear();
    player.send({ type: 'tradeClose' });
}

class Trade extends Container {
    constructor(player) {
        super(
            TRADE_CAPACITY,
            StackPolicy.USE_FUNCTION,
            IDComparator,
            definitionStackable
        );

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
            processTradeRequest(this.player, otherPlayer);
            processTradeRequest(otherPlayer, this.player);
        } else {
            this.player.message('Sending trade request');
            otherPlayer.message(
                `${this.player.username} wishes to trade with you`
            );
            otherPlayer.trade.requests.add(this.player);
            this.tradingWith = otherPlayer;
        }
    }

    accept() {}

    decline() {
        // capture reference since processTradeClose mods this variable
        const other = this.tradingWith;

        processTradeClose(this.player);
        processTradeClose(other);

        other.message('Other player has declined trade');
    }

    confirmAccept() {}

    updateItems(items) {
        // clear all previous items
        super.clear();

        for (const item of items) {
            if (!this.player.inventory.has(item)) {
                // they don't have this item
                this.player.message('You dont have that item');
                break;
            }
            if (!super.add(item, item.amount)) {
                // unable to add item to container, could be full
                this.player.message('Failed to add item to trade');
                break;
            }
        }

        console.log(super.toJSON());

        // add to next tick counter
        this.tradingWith.send({
            type: 'tradeItems',
            items: super.toJSON()
        });
    }
}

module.exports = Trade;
