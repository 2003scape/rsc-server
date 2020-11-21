// https://classic.runescape.wiki/w/Transcript:Ned

const BALL_OF_WOOL_ID = 207;
const WIG_ID = 245;

async function otherThingsFromWool(player, npc) {
    await npc.say('I am sure I can. What are you thinking of?');

    const choice = await player.ask(
        [
            'Could you knit me a sweater?',
            'How about some sort of a wig?',
            'Could you repair the arrow holes in the back of my shirt?'
        ],
        true
    );

    switch (choice) {
        case 0: // sweater
            await npc.say(
                'Do I look like a member of a sewing circle?',
                "Be off wi' you, I have fought monsters that would turn your " +
                    'hair blue',
                "I don't need to be laughed at just 'cos I am getting a bit old"
            );
            break;
        case 1: // wig
            await npc.say(
                'Well... Thats an interesting thought',
                'yes, I think I could do something',
                'Give me 3 balls of wool and I might be able to do it'
            );

            if (player.inventory.has(BALL_OF_WOOL_ID, 3)) {
                const { world } = player;

                const choice = await player.ask(
                    [
                        'I have that now. Please, make me a wig',
                        'I will come back when I need you to make me one'
                    ],
                    true
                );

                switch (choice) {
                    case 0: // now
                        await npc.say('Okay, I will have a go.');

                        player.message('@que@You hand Ned 3 balls of wool');
                        await world.sleepTicks(3);

                        player.message(
                            '@que@Ned works with the wool. His hands move ' +
                                "with a speed you couldn't imagine"
                        );

                        await world.sleepTicks(3);

                        player.inventory.remove(BALL_OF_WOOL_ID, 3);

                        await npc.say(
                            'Here you go, hows that for a quick effort? Not ' +
                                'bad I think!'
                        );

                        player.inventory.add(WIG_ID);
                        player.message('Ned gives you a pretty good wig');

                        await player.say(
                            'Thanks Ned, theres more to you than meets the eye'
                        );
                        break;
                    case 1: // come back
                        await npc.say(
                            'Well, it sounds like a challenge',
                            'come to me if you need one'
                        );
                        break;
                }
            } else {
                await player.say(
                    'great, I will get some. I think a wig would be useful'
                );
            }
            break;
        case 2: // arrow holes
            await npc.say(
                'Ah yes, its a tough world these days',
                'Theres a few brave enough to attack from 10 metres away'
            );

            player.message('Ned pulls out a needle and attacks your shirt');
            await npc.say('There you go, good as new');

            await player.say(
                'Thanks Ned, maybe next time they will attack me face to face'
            );
            break;
    }
}

module.exports = { otherThingsFromWool };
