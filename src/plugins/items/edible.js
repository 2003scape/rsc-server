const edible = require('@2003scape/rsc-data/edible');

async function heal(player, amount) {
    const { world } = player;

    const oldHits = player.skills.hits.current;

    player.skills.hits.current = Math.min(
        oldHits + amount,
        player.skills.hits.base
    );

    await world.sleepTicks(1);

    if (oldHits < player.skills.hits.current) {
        player.message('@que@It heals some health');
        player.sendStats();
    }
}

async function onInventoryCommand(player, item) {
    if (player.locked || !/eat/i.test(item.definition.command)) {
        return false;
    }

    const edibleDefinition = edible[item.id];

    if (!Number.isNaN(+edibleDefinition)) {
        player.lock();

        // normal food item with no special behaviour, just heal
        player.message(
            `@que@You eat the ${item.definition.name.toLowerCase()}`
        );

        await heal(player, edibleDefinition);
        player.inventory.remove(item.id);

        player.unlock();

        return true;
    } else if (typeof edibleDefinition === 'object') {
        player.lock();

        const { hits, result, message } = edibleDefinition;

        if (message) {
            const messages = Array.isArray(message) ? message : [message];

            for (const unformatted of messages) {
                player.message(`@que@${unformatted}`);
            }
        } else {
            player.message(
                `@que@You eat the ${item.definition.name.toLowerCase()}`
            );
        }

        await heal(player, hits || 0);
        player.inventory.remove(item.id);

        // the edible turns into something else (pie tin, partial cake, etc.)
        if (typeof result !== 'undefined') {
            player.inventory.add(result);
        }

        player.unlock();

        return true;
    }

    return false;
}

module.exports = { onInventoryCommand };
