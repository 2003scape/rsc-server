const random = require('random');

// { prayerIndex: { skill: 'skill', multiplier: 1.05 }, ... }
const PRAYER_BONUSES = {
    // thick skin
    0: { skill: 'defense', multiplier: 1.05 },
    // burst of strength
    1: { skill: 'strength', multiplier: 1.05 },
    // clarity of thought
    2: { skill: 'attack', multiplier: 1.05 },
    // rock skin
    3: { skill: 'defense', multiplier: 1.1 },
    // superhuman strength
    4: { skill: 'strength', multiplier: 1.1 },
    // improved reflexes
    5: { skill: 'attack', multiplier: 1.1 },
    // steel skin
    9: { skill: 'defense', multiplier: 1.15 },
    // ultimate strength
    10: { skill: 'strength', multiplier: 1.15 },
    // incredible reflexes
    11: { skill: 'attack', multiplier: 1.15 }
};

const STYLE_BONUSES = { strength: 1, attack: 2, defense: 3 };

function getStyleBonus(player, skill) {
    const style = player.combatStyle;

    if (style === 0) {
        return 1;
    }

    return STYLE_BONUSES[skill] === style ? 3 : 0;
}

function getPrayerBonuses(player) {
    const bonuses = { defense: 1, strength: 1, attack: 1 };

    for (const [index, enabled] of player.prayers.entries()) {
        if (enabled) {
            const prayer = PRAYER_BONUSES[index];

            if (!prayer) {
                break;
            }

            bonuses[prayer.skill] = prayer.multiplier;
        }
    }

    return bonuses;
}

function getGaussian(meanModifier, maximum) {
    const mean = maximum * meanModifier;
    const deviation = mean * 1.79;
    const normal = random.normal(mean, deviation);

    let value;

    do {
        value = Math.floor(mean + normal() * deviation);
    } while (value < 0 || value > maximum);

    return value;
}

function getAccuracy(player) {
    const styleBonus = getStyleBonus(player, 'attack');
    const prayerBonus = getPrayerBonuses(player).attack;

    const attackLevel =
        Math.floor(player.skills.attack.current * prayerBonus) + styleBonus + 8;

    const bonusMultiplier = player.equipmentBonuses.weaponAim + 64;

    return attackLevel * bonusMultiplier;
}

function getProtection(player) {
    const styleBonus = getStyleBonus(player, 'defense');
    const prayerBonus = getPrayerBonuses(player).defense;

    const defenseLevel =
        Math.floor(player.skills.defense.current * prayerBonus) +
        styleBonus +
        8;

    const bonusMultiplier = player.equipmentBonuses.armour + 64;

    return defenseLevel * bonusMultiplier;
}

function getMaxHit(player) {
    const styleBonus = getStyleBonus(player, 'strength');
    const prayerBonus = getPrayerBonuses(player).strength;

    const strengthLevel =
        Math.floor(player.skills.strength.current * prayerBonus) +
        styleBonus +
        8;

    const bonusMultiplier = (player.equipmentBonuses.weaponPower + 64) / 640;

    return Math.floor(strengthLevel * bonusMultiplier + 0.5);
}

function rollDamage(accuracy, maxHit, protection) {
    if (accuracy * 10 < protection) {
        return 0;
    }

    if (accuracy > protection) {
        accuracy = 1.0 - (protection + 2.0) / (2.0 * (accuracy + 1.0))
    } else {
        accuracy /= 2.0 * (protection + 1.0);
    }

    if (accuracy > Math.random()) {
        return Math.floor(getGaussian(1.0, maxHit));
    }

    return 0;
}

function rollPlayerNPCDamage(player, npc) {
    const accuracy = getAccuracy(player);
    const maxHit = getMaxHit(player);
    const protection = npc.skills.defense.current + 65 * 0.9;

    console.log('our accuracy', accuracy);
    console.log('our max hit', maxHit);

    return rollDamage(accuracy, maxHit, protection);
}

function rollNPCDamage(npc, player) {
    const accuracy = npc.skills.attack.current * (65 * 0.9);

    const maxHit = Math.max(0, Math.floor(
        (npc.skills.strength.current + 8) * (65 / 640) + 0.5
    ) - 1);

    const protection = getProtection(player);

    console.log('npc accuracy', accuracy);
    console.log('npc max hit', maxHit);

    return rollDamage(accuracy, maxHit, protection);
}

module.exports = { rollPlayerNPCDamage, rollNPCDamage };
