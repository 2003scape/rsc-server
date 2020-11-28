const prayers = require('@2003scape/rsc-data/config/prayers');

const PRAYER_SKILLS = {
    0: 'defense',
    1: 'strength',
    2: 'attack',
    3: 'defense',
    4: 'strength',
    5: 'attack',
    9: 'defense',
    10: 'strength',
    11: 'attack'
};

async function prayerOn({ player }, { index }) {
    if (index < 0 || index > player.prayers.length) {
        throw new RangeError(`${player} using prayer out of range ${index}`);
    }

    if (prayers[index].level > player.skills.prayer.base) {
        throw new Error(`${player} activating prayer above their level`);
    }

    if (player.skills.prayer.current <= 0) {
        player.message(
            'You have run out of prayer points. Return to a church to recharge'
        );

        return;
    }

    for (let i = 0; i < player.prayers.length; i += 1) {
        if (player.prayers[i]) {
            if (PRAYER_SKILLS[index] === PRAYER_SKILLS[i]) {
                player.prayers[i] = false;
                player.sendPrayerStatus();
                break;
            }
        }
    }

    player.sendSound('prayeron');
    player.prayers[index] = true;
}

async function prayerOff({ player }, { index }) {
    if (index < 0 || index > player.prayers.length) {
        throw new RangeError(`${player} using prayer out of range ${index}`);
    }

    if (player.prayers[index]) {
        player.sendSound('prayeroff');
        player.prayers[index] = false;
    }
}

module.exports = { prayerOn, prayerOff };
