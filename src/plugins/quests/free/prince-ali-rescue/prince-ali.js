// https://classic.runescape.wiki/w/Transcript:Prince_Ali

const BLONDE_WIG_ID = 244;
const BRONZE_KEY_ID = 242;
const PASTE_ID = 240;
const PRINCE_ALI_DRAG_ID = 126;
const PRINCE_ALI_ID = 118;
const SKIRT_ID = 194;

async function onTalkToNPC(player, npc) {
    if (npc.id !== PRINCE_ALI_ID) {
        return false;
    }

    const questStage = player.questStages.princeAliRescue;

    player.engage(npc);

    if (questStage === 3) {
        await player.say('Prince, I come to rescue you');
        await npc.say('That is very very kind of you, how do I get out?');

        await player.say(
            'With a disguise, I have removed the Lady Keli',
            'She is tied up, but will not stay tied up for long'
        );

        const hasEquipment =
            player.inventory.has(BRONZE_KEY_ID) &&
            player.inventory.has(BLONDE_WIG_ID) &&
            player.inventory.has(SKIRT_ID) &&
            player.inventory.has(PASTE_ID);

        if (hasEquipment) {
            const { world } = player;

            await player.say('Take this disguise, and this key');

            player.inventory.remove(BRONZE_KEY_ID);
            player.inventory.remove(BLONDE_WIG_ID);
            player.inventory.remove(SKIRT_ID);
            player.inventory.remove(PASTE_ID);

            player.message(
                '@que@You hand the disguise and the key to the prince'
            );

            player.disengage();

            const princeAliDrag = world.replaceEntity(
                'npcs',
                npc,
                PRINCE_ALI_DRAG_ID
            );

            player.engage(princeAliDrag);

            await princeAliDrag.say(
                'Thankyou my friend, I must leave you now',
                'My father will pay you well for this'
            );

            await player.say('Go to Leela, she is close to here');

            player.disengage();
            world.removeEntity('npcs', princeAliDrag);

            /*let ladyKeli = world.npcs.getByID(LADY_KELI_ID);

            if (!ladyKeli) {
                if (world.keliRespawnTimer) {
                    world.clearTimeout(world.keliRespawnTimer);
                }

                ladyKeli = new NPC(world, {
                    id: LADY_KELI_ID,
                    x: 197,
                    y: 641,
                    minX: 194,
                    maxX: 198,
                    minY: 637,
                    maxY: 642
                });

                world.addEntity('npcs', ladyKeli);
            }*/

            // https://youtu.be/lnasx7aG6rI?t=325
            // keli doesn't actually respawn right away

            player.message(
                '@que@The prince has escaped, well done!',
                '@que@You are now a friend of Al kharid',
                '@que@And may pass through the Al Kharid toll gate for free'
            );

            player.questStages.princeAliRescue = 4;
        } else {
            await npc.say(
                "You don't seem to have all I need to escape yet",
                'I dare not risk death to these people'
            );
        }
    } else {
        await npc.say(
            'I owe you my life for that escape',
            'You cannot help me this time, they know who you are',
            'Go in peace, friend of Al Kharid'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onTalkToNPC };
