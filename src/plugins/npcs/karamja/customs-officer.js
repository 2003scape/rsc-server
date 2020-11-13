// https://classic.runescape.wiki/w/Transcript:Customs_Officer

const CUSTOMS_OFFICER_ID = 163;
const RUM_ID = 318;

const SHIP_IDS = new Set([161, 162, 163]);

const portSarim = require('@2003scape/rsc-data/regions')['port-sarim'];

async function talkToOfficer(player, npc) {
    const { world } = player;

    await npc.say('You need to be searched before you can board');

    const choice = await player.ask(
        [
            'Why?',
            'Search away I have nothing to hide',
            "You're not putting your hands on my things"
        ],
        true
    );

    switch (choice) {
        case 0: // why
            await npc.say(
                'Because Asgarnia has banned the import of intoxicating spirits'
            );
            break;
        case 1: // search away
            if (player.inventory.has(RUM_ID)) {
                await npc.say('Aha trying to smuggle rum are we?');
                player.inventory.remove(RUM_ID);
                player.message('@que@The customs officer confiscates your rum');
            } else {
                await npc.say(
                    "Well you've got some odd stuff, but it's all legal",
                    'Now you need to pay a boarding charge of 30 gold'
                );

                const choice = await player.ask(
                    ['Ok', "Oh, I'll not bother then"],
                    true
                );

                if (choice === 0) {
                    if (player.inventory.has(10, 30)) {
                        player.inventory.remove(10, 30);
                        player.message('@que@You pay 30 gold');
                        await world.sleepTicks(2);
                        player.message('@que@You board the ship');
                        await world.sleepTicks(2);
                        player.teleport(portSarim.spawnX, portSarim.spawnY);
                        await world.sleepTicks(2);
                        player.message('@que@The ship arrives at Port Sarim');
                    } else {
                        await player.say(
                            "Oh dear I don't seem to have enough money"
                        );
                    }
                }
            }

            break;
        case 2: // hands on my things
            await npc.say("You're not getting on this ship then");
            break;
    }
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== CUSTOMS_OFFICER_ID) {
        return false;
    }

    player.engage(npc);

    const choice = await player.ask(
        [
            'Can I board this ship?',
            'Does Karamja have any unusual customs then?'
        ],
        true
    );

    if (choice === 0) {
        await talkToOfficer(player, npc);
    } else {
        await npc.say("I'm not that sort of customs officer");
    }

    player.disengage(npc);

    return true;
}

async function onGameObjectCommandOne(player, gameObject) {
    if (!SHIP_IDS.has(gameObject.id)) {
        return false;
    }

    const { world } = player;

    const [officer] = Array.from(world.npcs.getAllByID(CUSTOMS_OFFICER_ID))
        .filter((npc) => {
            return (
                !npc.interlocutor && player.localEntities.known.npcs.has(npc)
            );
        })
        .sort((a, b) => {
            if (a.getDistance(player) > b.getDistance(player)) {
                return 1;
            } else {
                return -1;
            }
        });

    if (officer) {
        player.engage(officer);
        await talkToOfficer(player, officer);
        player.disengage();
    } else {
        player.message(
            '@que@I need to speak to the customs officer before boarding the ' +
                'ship.'
        );
    }

    return true;
}

module.exports = { onTalkToNPC, onGameObjectCommandOne };
