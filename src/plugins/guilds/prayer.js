// https://classic.runescape.wiki/w/Monastery_(Prayer_Guild)
// https://classic.runescape.wiki/w/Transcript:Brother_Jered

const ABBOT_LANGLEY_ID = 174;
const BLESSED_HOLY_SYMBOL_ID = 385;
const BROTHER_JERED_ID = 176;
const LADDER_ID = 198;
const UNBLESSED_HOLY_SYMBOL_ID = 45;
const UNSTRUNG_HOLY_SYMBOL_ID = 44;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== LADDER_ID) {
        return false;
    }

    const { world } = player;
    const joinedPrayerGuild = !!player.cache.joinedPrayerGuild;

    if (joinedPrayerGuild) {
        player.climb(gameObject, true);
    } else {
        const abbotLangley = world.npcs.getByID(ABBOT_LANGLEY_ID);

        if (!abbotLangley || abbotLangley.interlocutor) {
            player.message('Abbot Langley is busy at the moment.');
        } else {
            player.engage(abbotLangley);

            await abbotLangley.say('Only members of our order can go up there');

            const choice = await player.ask(
                ['Well can i join your order?', 'Oh sorry'],
                false
            );

            switch (choice) {
                case 0: // join
                    await player.say('Well can I join your order?');

                    if (player.skills.prayer.current >= 31) {
                        await abbotLangley.say(
                            'Ok I see you are someone suitable for our order',
                            'You may join'
                        );

                        player.cache.joinedPrayerGuild = true;
                        player.climb(gameObject, true);
                    } else {
                        await abbotLangley.say(
                            'No I feel you are not devout enough'
                        );

                        player.message('You need a prayer level of 31');
                    }
                    break;
                case 1: // sorry
                    await player.say('Oh sorry');
                    break;
            }

            player.disengage();
        }
    }

    return true;
}

async function onTalkToNPC(player, npc) {
    if (npc.id !== BROTHER_JERED_ID) {
        return false;
    }

    player.engage(npc);

    await player.say(
        'What can you do to help a bold adventurer such as myself?'
    );

    if (player.inventory.has(UNBLESSED_HOLY_SYMBOL_ID)) {
        const { world } = player;

        await npc.say('Well I can bless that star of Saradomin you have');

        const choice = await player.ask(['Yes Please', 'No thankyou'], false);

        switch (choice) {
            case 0: // yes
                await player.say('Yes Please');

                player.inventory.remove(UNBLESSED_HOLY_SYMBOL_ID);
                player.message('@que@You give Jered the symbol');
                await world.sleepTicks(3);

                player.message(
                    '@que@Jered closes his eyes and places his hand on the ' +
                        'symbol'
                );

                await world.sleepTicks(3);

                player.message('@que@He softly chants');
                await world.sleepTicks(3);

                player.inventory.add(BLESSED_HOLY_SYMBOL_ID);
                player.message('@que@Jered passes you the holy symbol');
                break;
            case 1: // no
                await player.say('No Thankyou');
                break;
        }
    } else if (player.inventory.has(UNSTRUNG_HOLY_SYMBOL_ID)) {
        await npc.say(
            'Well if you put a string on that holy symbol',
            'I can bless it for you"' // sic
        );
    } else {
        await npc.say(
            'If you have a silver star',
            'Which is the holy symbol of Saradomin',
            'Then I can bless it',
            'Then if you are wearing it',
            'It will help you when you are praying'
        );
    }

    player.disengage();
    return true;
}

module.exports = { onGameObjectCommandOne, onTalkToNPC };
