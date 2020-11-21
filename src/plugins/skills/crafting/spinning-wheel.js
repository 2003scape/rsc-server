// https://classic.runescape.wiki/w/Spinning_wheel
// https://classic.runescape.wiki/w/Crafting#Spinning

const BALL_OF_WOOL_ID = 207;
const BOWSTRING_ID = 676;
const FLAX_ID = 675;
const SPINNING_WHEEL_ID = 121;
const WOOL_ID = 145;

async function onUseWithGameObject(player, gameObject, item) {
    if (
        gameObject.id !== SPINNING_WHEEL_ID ||
        !(item.id === WOOL_ID || item.id === FLAX_ID)
    ) {
        return false;
    }

    const { world } = player;

    player.lock();

    player.sendBubble(item.id);
    player.inventory.remove(item.id);
    player.sendSound('mechanical');

    if (item.id === WOOL_ID) {
        player.message('You spin the sheeps wool into a nice ball of wool');
        player.inventory.add(BALL_OF_WOOL_ID);
        player.addExperience('crafting', 10);
    } else if (item.id === FLAX_ID) {
        if (player.skills.crafting.current >= 10) {
            player.message('You make the flax into a bow string');
            player.inventory.add(BOWSTRING_ID);
            player.addExperience('crafting', 60);
        } else {
            player.message(
                'You need a crafting level of 10 or higher to make a bowstring'
            );
        }
    }

    await world.sleepTicks(1);

    player.unlock();
    return true;
}

module.exports = { onUseWithGameObject };
