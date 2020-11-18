async function getNPC(player, index) {
    const { world } = player;

    const npc = world.npcs.getByIndex(index);

    if (!npc) {
        throw new RangeError(`invalid npc index ${index}`);
    }

    if (!npc.withinRange(player, 3, true)) {
        if (npc.withinRange(player, 8)) {
            await player.chase(npc, false);
        } else {
            return;
        }

        if (!npc.withinRange(player, 3, true)) {
            return;
        }
    }

    return npc;
}

async function npcTalk({ player }, { index }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const npc = await getNPC(player, index);

        if (!npc) {
            return;
        }

        if (npc.interlocutor) {
            player.message(`The ${npc.definition.name} is busy at the moment`);
            return;
        }

        if (npc.opponent || npc.locked) {
            return;
        }

        npc.stepsLeft = 0;

        const blocked = await world.callPlugin('onTalkToNPC', player, npc);

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

        if (!npc || npc.locked) {
            return;
        }

        npc.stepsLeft = 0;

        const blocked = await world.callPlugin(
            'onUseWithNPC',
            player,
            npc,
            item
        );

        if (blocked) {
            return;
        }

        player.message('Nothing interesting happens');
    };
}

async function npcAttack({ player }, { index }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const npc = await getNPC(player, index);

        if (!npc) {
            return;
        }

        if (!npc.definition.hostility) {
            throw new Error(`${player} trying to attack unattackable NPC`);
        }

        if (npc.opponent || npc.interlocutor || npc.locked) {
            return;
        }

        npc.stepsLeft = 0;

        const blocked = await world.callPlugin('onNPCAttack', player, npc);

        if (blocked) {
            return;
        }

        await player.attack(npc);
    };
}

module.exports = { npcTalk, useWithNPC, npcAttack };
