const ODD_WALL_ID = 22;
const SIDE_DOOR_ID = 40;

function enterExitOddWall(player, wallObject) {
    if (player.y >= wallObject.y) { // entering wall gap
        player.teleport(wallObject.x, wallObject.y - 1);
        return true;
    }

    player.teleport(wallObject.x, wallObject.y); // leaving wall gap
    return true;
}

function enterExitSideEntrnace(player, wallObject) {

}

function enterExitSideRoom(player, wallObject) {
    if (player.y >= wallObject.y) {
        player.teleport(wallObject.x, wallObject.y - 1); // entering guarded room
        return true;
    }

    // TODO: DIE INTRUDER!!, you get attacked leaving the guarded room sometimes

    player.teleport(wallObject.x, wallObject.y); // leaving the guarded room through the side
    return true;
}

async function onWallObjectCommandOne(player, wallObject) {
    if (wallObject.id === SIDE_DOOR_ID) {
        return await enterExitSideRoom(player, wallObject);
    } else if (wallObject.id === ODD_WALL_ID) {
        return enterExitOddWall(player, wallObject);
    }

    console.log('interacted with wallObject at (' + wallObject.x + ', ' + wallObject.y + ')' + ': ' + wallObject.id);
	return false;
}

module.exports = { onWallObjectCommandOne };