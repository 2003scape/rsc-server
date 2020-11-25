// https://classic.runescape.wiki/w/Drain

const BUCKET_ID = 21;
const DRAIN_ID = 77;
const DRAIN_KEY_ID = 51;
const WATER_ID = 50;

const DRAIN_MESSAGES = [
    'This is the drainpipe',
    'Running from the kitchen sink to the sewer',
    'I can see a key just inside the drain',
    'That must be the key Sir Prysin dropped',
    "I don't seem to be able to quite reach it",
    "It's stuck part way down",
    'I wonder if I can dislodge it somehow',
    'And knock it down into the sewers'
];

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== DRAIN_ID) {
        return false;
    }

    const questStage = player.questStages.demonSlayer;

    if (!questStage || questStage === 1) {
        player.message("@que@I can see a key but can't quite reach it...");
    } else {
        const { world } = player;

        for (const message of DRAIN_MESSAGES) {
            player.message(`@que@${message}`);
            await world.sleepTicks(2);
        }
    }
}

async function onUseWithGameObject(player, gameObject, item) {
    if (gameObject.id !== DRAIN_ID || item.id !== WATER_ID) {
        return false;
    }

    const questStage = player.questStages.demonSlayer;

    if (!questStage || questStage === 1) {
        player.message('@que@I have no reason to do that.');
    } else {
        const { world } = player;

        player.inventory.remove(WATER_ID);
        player.inventory.add(BUCKET_ID);
        player.message('@que@You pour the liquid down the drain');
        player.message("@que@Ok I think I've washed the key into the sewer");
        world.addPlayerDrop(player, DRAIN_KEY_ID, 117, 3294);

        await world.sleepTicks(3);

        player.message(
            "@que@I'd better go down and get it before someone else finds it"
        );
    }

    return true;
}

module.exports = { onGameObjectCommandTwo, onUseWithGameObject };
