class Bank {
    constructor(player, items = []) {
        this.player = player;
        this.items = items;
    }

    toJSON() {
        return [];
    }
}

module.exports = Bank;
