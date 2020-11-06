function bankOpen(player) {
    if (!player.interfaceOpen.bank) {
        player.bank.close();
        return false;
    }

    return true;
}

async function bankDeposit({ player }, { id, amount }) {
    if (bankOpen(player)) {
        player.bank.deposit(id, amount);
    }
}

async function bankWithdraw({ player }, { id, amount }) {
    if (bankOpen(player)) {
        player.bank.withdraw(id, amount);
    }
}

async function bankClose({ player }) {
    if (player.interfaceOpen.bank) {
        player.bank.close();
    }
}

module.exports = { bankDeposit, bankWithdraw, bankClose };
