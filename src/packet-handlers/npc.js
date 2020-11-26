async function getNPC(player, index) {
    if (player.locked) {
        return;
    }

    const { world } = player;
    const npc = world.npcs.getByIndex(index);

    if (!npc) {
        throw new RangeError(`invalid npc index ${index}`);
    }

    if (!npc.withinRange(player, 3, true)) {
        if (npc.withinRange(player, 8)) {
            await world.sleepTicks(1);
            await player.chase(npc);
        } else {
            return;
        }

        if (!npc.withinRange(player, 3, true)) {
            return;
        }
    }

    npc.stepsLeft = 0;
    player.lock();

    await world.sleepTicks(1);

    return npc;
}

async function npcTalk({ player }, { index }) {
    /*const npc = player.world.npcs.getByIndex(index);
    await npc.walkToPoint(npc.x + 1, npc.y);*/

    player.endWalkFunction = async () => {
        const { world } = player;
        const npc = await getNPC(player, index);

        if (!npc) {
            return;
        }

        if (npc.interlocutor) {
            player.unlock();
            player.message(`The ${npc.definition.name} is busy at the moment`);
            return;
        }

        if (npc.opponent || npc.locked) {
            player.unlock();
            return;
        }

        npc.lock();

        const blocked = await world.callPlugin('onTalkToNPC', player, npc);

        player.unlock();
        npc.unlock();

        if (blocked) {
            return;
        }

        player.message(
            `The ${npc.definition.name} does not appear interested in talking`
        );
    };
}

async function useWithNPC({ player }, { npcIndex, index }) {
    player.endWalkFunction = async () => {
        const item = player.inventory.items[index];

        if (!item) {
            throw new RangeError(`invalid item index ${index}`);
        }

        const { world } = player;
        const npc = await getNPC(player, npcIndex);

        if (!npc) {
            player.unlock();
            return;
        }

        if (!world.members && item.definition.members) {
            player.message('Nothing interesting happens');
            return;
        }

        npc.lock();

        const blocked = await world.callPlugin(
            'onUseWithNPC',
            player,
            npc,
            item
        );

        player.unlock();
        npc.unlock();

        if (!blocked) {
            player.message('Nothing interesting happens');
        }
    };
}

async function npcAttack({ player }, { index }) {
    const { world } = player;
    const npc = world.npcs.getByIndex(index);

    if (!npc) {
        throw new RangeError(`invalid npc index ${index}`);
    }

    player.toAttack = npc;

    player.endWalkFunction = async () => {
        const { world } = player;

        const npc = await getNPC(player, index);

        if (!npc) {
            return;
        }

        if (!npc.definition.hostility) {
            player.unlock();
            throw new Error(`${player} trying to attack unattackable NPC`);
        }

        if (npc.locked) {
            player.unlock();
            return;
        }

        npc.lock();

        const blocked = await world.callPlugin('onNPCAttack', player, npc);

        if (!blocked) {
            await player.attack(npc);
        } else {
            player.unlock();
            npc.unlock();
        }
    };
}

module.exports = { npcTalk, useWithNPC, npcAttack };
