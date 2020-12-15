// createSteps can move in straight lines (that is, if x or y is being
// incremented alone) or perfect diagonals (x and y both being incremented the
// same amount). it produces an array of deltas for the player to follow.

// (0, 3) -> (0, 6): [{ x: 0, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 1}]
// (0, 0) -> (3, 3): [{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }]
function createSteps(startX, startY, endX, endY) {
    const totalSteps = Math.abs(endX - startX) + Math.abs(endY - startY);
    let currentSteps = 0;
    const steps = [];

    // check if we're moving backwards or forwards
    let deltaX = startX < endX ? 1 : -1;
    let deltaY = startY < endY ? 1 : -1;

    // check if this is a perfectly diagonal path
    if (Math.abs(endX - startX) !== Math.abs(endY - startY)) {
        // we're moving in the x direction, so don't change y.
        if (endX - startX !== 0) {
            deltaY = 0;
        } else {
            deltaX = 0;
        }
    }

    while (currentSteps !== totalSteps) {
        steps.push({ deltaX, deltaY });
        currentSteps += Math.abs(deltaX) + Math.abs(deltaY);
    }

    return steps;
}

async function walk({ player }, { targetX, targetY, steps }) {
    if (player.opponent && !player.retreating) {
        if (player.combatRounds <= 3) {
            player.message(
                "You can't retreat during the first 3 rounds of combat"
            );

            return;
        } else {
            await player.retreat();
        }
    } else if (player.locked) {
        if (player.dontAnswer) {
            player.dontAnswer();
        }

        return;
    }

    const { world } = player;

    if (typeof player.rangedTimeout === 'number') {
        world.clearTickTimeout(player.rangedTimeout);
        delete player.rangedTimeout;
    }

    player.following = null;
    player.toAttack = null;
    player.chasing = null;
    player.endWalkFunction = null;
    player.walkQueue.length = 0;

    let currentX = player.x;
    let currentY = player.y;

    player.walkQueue.push(...createSteps(currentX, currentY, targetX, targetY));

    currentX = targetX;
    currentY = targetY;

    for (const { deltaX, deltaY } of steps) {
        player.walkQueue.push(
            ...createSteps(
                currentX,
                currentY,
                targetX + deltaX,
                targetY + deltaY
            )
        );

        currentX = targetX + deltaX;
        currentY = targetY + deltaY;
    }
}

async function walkAction(socket, message) {
    const { player } = socket;

    if (player.opponent) {
        return;
    }

    player.walkAction = true;

    await walk(socket, message);
}

module.exports = { walk, walkAction };
