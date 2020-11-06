const Item = require('./item');

class Bank {
    constructor(player, items = []) {
        this.player = player;
        this.items = items.map((item) => new Item(item));

        this.maxItems = 48;

        if (this.player.world.members) {
            this.maxItems *= 4;
        }
    }

    open() {
        this.player.lock();
        this.player.interfaceOpen.bank = true;
        this.sendOpen();
    }

    sendOpen() {
        this.player.send({
            type: 'bankOpen',
            maxItems: this.maxItems,
            items: this.items
        });
    }

    close(send = true) {
        this.player.interfaceOpen.bank = false;
        this.player.unlock();

        if (send) {
            this.player.send({ type: 'bankClose' });
        }
    }

    getItem({ id }) {
        return this.items.find((item) => item.id === id);
    }

    deposit(id, amount) {
        if (!this.player.inventory.has(id, amount)) {
            throw new RangeError(`${player} depositing item they don't have`);
        }

        this.player.inventory.remove(id, amount);

        const bankItem = this.getItem({ id });
        let index;

        if (bankItem) {
            bankItem.amount += amount;
            index = this.items.indexOf(bankItem);
        } else {
            index = this.items.push(new Item({ id, amount })) - 1;
        }

        this.update(index);
    }

    withdraw(id, amount) {
        const bankItem = this.getItem({ id });

        if (!bankItem || bankItem.amount < amount) {
            throw new RangeError(`${player} withdrawing item they don't have`);
        }

        this.player.inventory.add(id, amount);

        const index = this.items.indexOf(bankItem);

        bankItem.amount -= amount;

        if (bankItem.amount === 0) {
            this.items.splice(index, 1);
            this.sendOpen();
        } else {
            this.update(index);
        }
    }

    update(index) {
        const item = this.items[index];
        this.player.send({ type: 'bankUpdate', index, ...item });
    }

    toJSON() {
        return this.items;
    }
}

module.exports = Bank;
