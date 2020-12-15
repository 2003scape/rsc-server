const random = require('random');

const {
    ammunition,
    weapons: rangedWeapons
} = require('@2003scape/rsc-data/ranged');

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

function getAccuracy(player) {
    const styleBonus = getStyleBonus(player, 'attack');
    const prayerBonus = getPrayerBonuses(player).attack;
    const attackLevel = player.skills.attack.current * prayerBonus + styleBonus;
    const bonusMultiplier = player.equipmentBonuses.weaponAim * (1 / 600) + 0.1;

    return attackLevel * bonusMultiplier;
}

function getProtection(player) {
    const styleBonus = getStyleBonus(player, 'defense');
    const prayerBonus = getPrayerBonuses(player).defense;

    const defenseLevel =
        player.skills.defense.current * prayerBonus + styleBonus;

    const bonusMultiplier = player.equipmentBonuses.armour * (1 / 600) + 0.1;

    return defenseLevel * bonusMultiplier;
}

function getMaxHit(player) {
    const styleBonus = getStyleBonus(player, 'strength');
    const prayerBonus = getPrayerBonuses(player).strength;

    const strengthLevel =
        player.skills.strength.current * prayerBonus + styleBonus;

    const bonusMultiplier =
        player.equipmentBonuses.weaponPower * (1 / 600) + 0.1;

    return Math.ceil(strengthLevel * bonusMultiplier);
}

function rollDamage(accuracy, maxHit, protection) {
    const odds = Math.floor(Math.min(212, (255 * accuracy) / (protection * 4)));
    const roll = Math.random() * 256;

    if (roll > odds) {
        return 0;
    }

    if (maxHit === 0 || maxHit === 1) {
        return maxHit;
    }

    const mean = maxHit / 2;
    const deviation = maxHit / 3;
    const normal = random.normal(mean, deviation);

    let i = 0;
    let value;

    do {
        value = Math.floor(mean + normal() * deviation);
        i += 1;

        if (i >= 25) {
            break;
        }
    } while (value < 1 || value > maxHit);

    if (value > maxHit) {
        return maxHit;
    }

    if (value < 1) {
        return 1;
    }

    return Math.floor(value);
}

function getRangedAccuracy(player) {
    const rangedLevel = player.skills.ranged.current;
    const rangedWeapon = player.inventory.getRangedWeapon();

    const bonusMultiplier = rangedWeapon
        ? rangedWeapons[rangedWeapon.id].accuracy * (1 / 600) + 0.1
        : 0;

    return rangedLevel * bonusMultiplier;
}

function getRangedMaxHit(player) {
    const rangedLevel = player.skills.ranged.current;

    const bonusMultiplier =
        ammunition[player.inventory.getAmmunitionID()] * (1 / 600) + 0.1;

    return Math.ceil(rangedLevel * bonusMultiplier);
}

function rollPlayerNPCDamage(player, npc) {
    const accuracy = getAccuracy(player);
    const maxHit = getMaxHit(player);
    const protection = npc.skills.defense.current * (1 / 600 + 0.1);

    return rollDamage(accuracy, maxHit, protection);
}

function rollPlayerPlayerDamage(player, targetPlayer) {
    const accuracy = getAccuracy(player);
    const maxHit = getMaxHit(player);
    const protection = getProtection(targetPlayer);

    return rollDamage(accuracy, maxHit, protection);
}

function rollNPCDamage(npc, player) {
    const accuracy = npc.skills.attack.current * (1 / 600 + 0.1);
    const maxHit = Math.ceil(npc.skills.strength.current * (1 / 600 + 0.1));
    const protection = getProtection(player);

    return rollDamage(accuracy, maxHit, protection);
}

function rollPlayerNPCRangedDamage(player, npc) {
    const accuracy = getRangedAccuracy(player);
    const maxHit = getRangedMaxHit(player);
    const protection = npc.skills.defense.current * (1 / 600 + 0.1);

    return rollDamage(accuracy, maxHit, protection);
}

module.exports = {
    rollPlayerNPCDamage,
    rollPlayerPlayerDamage,
    rollNPCDamage,
    rollPlayerNPCRangedDamage
};
