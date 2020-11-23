// this is a unique black knight than the others
const BLACK_KNIGHT_ID = 108;
const GRELDO_ID = 109;
const WITCH_ID = 107;

const GRILL_ID = 148;

async function onGameObjectCommandOne(player, gameObject) {
    if (gameObject.id !== GRILL_ID) {
        return false;
    }

    // You can't hear the plans before starting the quest or after hearing it
    // once.
    if (player.questStages.blackKnightsFortress !== 1) {
        player.message("@que@I can't hear much right now");
        return true;
    }

    const { world } = player;

    const blackKnight = world.npcs.getByID(BLACK_KNIGHT_ID);
    const greldo = world.npcs.getByID(GRELDO_ID);
    const witch = world.npcs.getByID(WITCH_ID);

    player.engage(blackKnight);
    await blackKnight.say("So how's the secret weapon coming along?");
    blackKnight.disengage();

    player.engage(witch);

    await witch.say(
        'The invincibility potion is almost ready',
        "It's taken me five years but it's almost ready",
        'Greldo the Goblin here',
        'Is just going to fetch the last ingredient for me',
        "It's a specially grown cabbage",
        'Grown by my cousin Helda who lives in Draynor Manor',
        'The soil there is slightly magical',
        'And it gives the cabbages slight magic properties',
        'Not to mention the trees',
        'Now remember Greldo only a Draynor Manor cabbage will do',
        "Don't get lazy and bring any old cabbage",
        'That would entirely wreck the potion'
    );

    player.disengage();

    player.engage(greldo);
    await greldo.say('Yeth Mithreth');
    player.disengage();

    player.questStages.blackKnightsFortress = 2;
}

module.exports = { onGameObjectCommandOne };

