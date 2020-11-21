const GUARD_ID = 100;

const ENTRANCE_ID = 38;
const GUARDED_DOOR_ID = 39

const IRON_CHAIN_ID = 7;
const MED_BRONZE_ID = 104;

async function enterExitFortress(player, wallObject) {
    if (player.x >= wallObject.x) { // exiting fortress
        player.teleport(wallObject.x - 1, wallObject.y); // TODO: fix door
        return true;
    }

    const hasUniform =
        player.inventory.isEquipped(IRON_CHAIN_ID) &&
        player.inventory.isEquipped(MED_BRONZE_ID);

    if (hasUniform) {
        player.teleport(wallObject.x, wallObject.y); // TODO: fix this door stuff
        return true;
    }

    // Actually, the original was pretty random about which guard bothers
    // you
    const guard = player.getNearestEntity('npcs', GUARD_ID);
    player.engage(guard);

    await guard.say(
        "Heh you can't come in here",
        'This is a high security military installation'
    );

    const choice = await player.ask(
        [ 'Yes but I work here', 'Oh sorry', 'So who does it belong to?' ],
        true
    );

    switch(choice) {
        case 0: // I work here
            await guard.say(
                'Well this is the guards entrance',
                'And I might be new here',
                "But I can tell you're not a guard",
                "You're not even wearing proper guards uniform"
            )

            const choice = await player.ask(
                [ 'Pleaasse let me in', 'So what is this uniform?' ],
                true
            );

            switch (choice) {
                case 0: // begging to be let in
                    await guard.say(
                        "Go away, you're getting annoying"
                    );
                    break;
                case 1: // asking what the uniform is
                    await guard.say(
                        'Well you can see me wearing it',
                        "It's iron chain mail and a medium bronze helmet"
                    );
                    break;
            }
            break;
        case 1: // apologizing
            await guard.say("Don't let it happen again");
            break;
        case 2: // who owns this place?
            await guard.say(
                'This fortress belongs to the order of black knights' +
                    'known as the Kinshra'
            );
            break;
    }

    player.disengage();
    return true;
}

async function enterExitGuardedRoom(player, wallObject) {
    if (player.x >= wallObject.x) { // leaving guarded room
        player.teleport(wallObject.x - 1, wallObject.y) // TODO: fix door
        return false;
    }

    const guard = player.getNearestEntity('npcs', GUARD_ID);
    player.engage(guard);

    await guard.say(
        "I wouldn't go in there if I woz you",
        'Those black knights are in an important meeting',
        "They said they'd kill anyone who went in there"
    );

    const choice = await player.ask(
        [ "Ok I won't", "I don't care I'm going in anyway" ], true
    );

    player.disengage();

    if (choice === 0) { // won't enter
        return true;
    }

    player.teleport(wallObject.x, wallObject.y); // TODO: fix door

    // TODO: DIE INTRUDER!!

    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
	if (wallObject.id === ENTRANCE_ID) {
        return await enterExitFortress(player, wallObject);
    } else if (wallObject.id === GUARDED_DOOR_ID) {
        return await enterExitGuardedRoom(player, wallObject);
    }

	return false;
}

module.exports = { onWallObjectCommandOne };