async function npcTalk({ player }, { index }) {
    player.endWalkFunction = async () => {
        const { world } = player;

        const npc = world.npcs.getByIndex(index);

        if (!npc) {
            throw new RangeError(`invalid npc index ${index}`);
        }

        if (!npc.withinRange(player, 2)) {
            return;
        }

        const blocked = await world.callPlugin('onTalkToNPC', player, npc);

        if (!blocked) {
            player.message(
                `The ${npc.definition.name} does not appear interested in ` +
                    'talking'
            );
        }
    };
}

module.exports = { npcTalk };
