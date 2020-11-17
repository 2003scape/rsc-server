// for recursively adding item drops
function addItemDrop(drops, currentDrops, entry) {
    if (entry.reference) {
        const rolled = rollItemDrop(drops, entry.reference);
        currentDrops.push(...rolled);
    } else {
        // if id is an array, drop multiple items in one entry
        if (Array.isArray(entry.id)) {
            for (let i = 0; i < entry.id.length; i += 1) {
                currentDrops.push({
                    id: entry.id[i],
                    amount: Array.isArray(entry.amount) ? entry.amount[i] : 1
                });
            }
        } else {
            currentDrops.push({
                id: entry.id,
                amount: entry.amount || 1
            });
        }
    }
}

// roll an entry from a weighted (out of 128) drop table. see
// https://github.com/2003scape/rsc-data#rolls/
function rollItemDrop(drops, index) {
    const npcDrops = drops[index];

    if (!npcDrops) {
        return [];
    }

    const currentDrops = [];

    const roll = Math.floor(Math.random() * 129);

    let currentWeight = 0;

    for (let i = 0; i < npcDrops.length; i += 1) {
        const entry = npcDrops[i];

        if (!entry.weight || entry.weight === 0) {
            addItemDrop(drops, currentDrops, entry);
            continue;
        }

        const nextWeight = currentWeight + entry.weight;

        if (roll >= currentWeight && roll < nextWeight) {
            addItemDrop(drops, currentDrops, entry);
        }

        currentWeight += entry.weight;
    }

    return currentDrops;
}

// get the x from the x/256 chance of rolling a success
function getSkillThreshold(low, high, level) {
    return (
        Math.floor((low * (99 - level)) / 98) +
        Math.floor((high * (level - 1)) / 98) +
        1
    );
}

// decide whether or not a skilling action should be successful.
// low is x/256 for success at level 1 (even if the action can't be performed),
// and high is x/256 for success at level 99.
// https://oldschool.runescape.wiki/w/Template:Skilling_success_chart
function rollSkillSuccess(low, high, level) {
    const threshold = getSkillThreshold(low, high, level);
    const roll = Math.floor(Math.random() * 257);
    return roll <= threshold;
}

// for fishing spots and other processes that can provide multiple resources
// at different levels within the same action.
// rolls is an array of [low, high], sorted by highest skill requirement first
// returns the index of the roll it chose, or -1 if fail
function rollCascadedSkillSuccess(rolls, level) {
    const thresholds = rolls.map(([low, high]) => {
        return getSkillThreshold(low, high, level);
    });

    for (let i = thresholds.length - 1; i > 0; i -= 1) {
        thresholds[i] = Math.floor(
            thresholds[i] * (1 - thresholds[i - 1] / 256)
        );
    }

    const roll = Math.floor(Math.random() * 257);
    let threshold = 0;

    for (let i = 0; i < thresholds.length; i += 1) {
        threshold += thresholds[i];

        if (roll <= threshold) {
            return i;
        }
    }

    return -1;
}

module.exports = { rollItemDrop, rollSkillSuccess, rollCascadedSkillSuccess };
