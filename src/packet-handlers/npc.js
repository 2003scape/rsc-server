async function npcTalk({ player }, { index }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const npc = world.npcs.getByIndex(index);

        if (!npc) {
            throw new RangeError(`invalid npc index ${index}`);
        }

        if (!npc.withinRange(player, 2)) {
            if (npc.withinRange(player, 8)) {
                await player.chase(npc);
            } else {
                return;
            }

            if (!npc.withinRange(player, 2)) {
                return;
            }
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

        const npc = world.npcs.getByIndex(npcIndex);

        if (!npc) {
            throw new RangeError(`invalid npc index ${index}`);
        }

        if (!npc.withinRange(player, 2)) {
            return;
        }

        if (npc.locked) {
            player.message(`The ${npc.definition.name} is busy at the moment`);
            return;
        }

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

module.exports = { npcTalk, useWithNPC };
