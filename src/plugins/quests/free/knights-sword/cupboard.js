const CLOSED_CUPBOARD_ID = 174;
const OPEN_CUPBOARD_ID = 175;
const PORTRAIT_ID = 264;
const SIR_VYVIN_ID = 138;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id === OPEN_CUPBOARD_ID) {
        const { world } = player;
        const sirVyvin = world.npcs.getByID(SIR_VYVIN_ID);

        if (sirVyvin && !sirVyvin.interlocutor) {
            player.engage(sirVyvin);

            await sirVyvin.say('Hey what are you doing?', "That's my cupboard");

            player.message(
                '@que@Maybe you need to get someone to distract Sir Vyvin ' +
                    'for you'
            );

            await world.sleepTicks(3);

            player.disengage();
        } else {
            const questStage = player.questStages.theKnightsSword;

            if (questStage !== 4 || player.inventory.has(PORTRAIT_ID)) {
                player.message('There is just a load of junk in here');
            } else {
                player.inventory.add(PORTRAIT_ID);

                player.message(
                    'You find a small portrait in here which you take'
                );
            }
        }

        return true;
    }

    if (gameObject.id === CLOSED_CUPBOARD_ID) {
        const { world } = player;
        world.replaceEntity('gameObjects', gameObject, OPEN_CUPBOARD_ID);
        player.message('You open the cupboard');
        return true;
    }

    return false;
}

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== OPEN_CUPBOARD_ID) {
        return false;
    }

    const { world } = player;

    world.replaceEntity('gameObjects', gameObject, CLOSED_CUPBOARD_ID);
    player.message('You close the cupboard');

    return true;
}

module.exports = { onGameObjectCommandOne, onGameObjectCommandTwo };
