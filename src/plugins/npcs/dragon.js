// https://classic.runescape.wiki/w/Dragon_(race)
// https://classic.runescape.wiki/w/Dragon_(Dragon_Slayer)

const ANTI_DRAGON_BREATH_SHIELD_ID = 420;

const DRAGON_IDS = new Set([
    // elvarg
    196
]);

async function onNPCAttack(player, npc) {
    if (!DRAGON_IDS.has(npc.id)) {
        return false;
    }

    // TODO scale max flame damage with the dragon's combat level
    let fireDamage = Math.floor(Math.random() * 65);
    const prayerDebuff = Math.floor(player.skills.prayer.base * 0.25);

    player.message('@que@The dragon breathes fire at you');

    if (player.inventory.isEquipped(ANTI_DRAGON_BREATH_SHIELD_ID)) {
        player.message(
            '@que@Your shield prevents some of the damage from the flames'
        );

        fireDamage = Math.floor(fireDamage * 0.2);
    }

    if (fireDamage >= 25) {
        player.message('You are fried');
    }

    player.skills.prayer.current = Math.max(
        0,
        player.skills.prayer.current - prayerDebuff
    );

    // if the dragon's fire kills us, don't initiate combat
    return player.damage(fireDamage);
}

module.exports = { onNPCAttack };
