// https://classic.runescape.wiki/w/Christmas_cracker

const CRACKER_ROLLS = require('@2003scape/rsc-data/rolls/cracker');
const { rollItemDrop } = require('../../rolls');

const CHRISTMAS_CRACKER_ID = 575;

async function awardWinner(player, otherPlayer) {
    const items = rollItemDrop(CRACKER_ROLLS, 'cracker');

    for (const item of items) {
        player.inventory.add(item);
    }

    player.message('You get the prize from the cracker');
    otherPlayer.message('The person you pull the cracker with gets the prize');
}

async function onUseWithPlayer(player, otherPlayer, item) {
    if (item.id !== CHRISTMAS_CRACKER_ID) {
        return false;
    }

    player.inventory.remove(CHRISTMAS_CRACKER_ID);
    player.sendBubble(CHRISTMAS_CRACKER_ID);
    player.message('You pull a christmas cracker');
    otherPlayer.message('You pull a christmas cracker');

    if (Math.random() >= 0.5) {
        await awardWinner(player, otherPlayer);
    } else {
        await awardWinner(otherPlayer, player);
    }

    return true;
}

module.exports = { onUseWithPlayer };
