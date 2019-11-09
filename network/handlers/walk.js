module.exports.name = 'walk'

// this function solves basic paths that the client expects us to do. it can
// move in straight lines (that is, if X or Y is being incremented alone), or
// perfect diagonals (X and Y both being incremented the same amount). it
// produces "instructions" for the client to follow as an array of deltas. for
// example, to solve (0, 3) -> (0, 6) this function would produce:
// [ { x: 0, y: 1 }, { x: 0, y: 1 }, { x: 0, y: 1} ]
// or to solve (0, 0) -> (3, 3):
// [ { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 } ]
// it would *not* solve (0, 0) -> (5, 8) for instance.
function createSteps(startX, startY, endX, endY) {
    // The total amount of steps we'll need to take to reach our goal.
    const totalSteps = Math.abs(endX - startX) + Math.abs(endY - startY)
    let currentSteps = 0

    // The positions we need to move to reach our goal.
    let steps = []

    // Check if we're moving backwards or forwards.
    let deltaX = startX < endX ? 1 : -1
    let deltaY = startY < endY ? 1 : -1

    // Check if this is a perfectly diagonal path.
    if (Math.abs(endX - startX) !== Math.abs(endY - startY)) {
        // We're moving in the X direction, so don't change Y.
        if ((endX - startX) !== 0) {
            deltaY = 0
        } else {
            deltaX = 0
        }
    }

    while (currentSteps !== totalSteps) {
        steps.push({
            x: deltaX,
            y: deltaY
        })
        currentSteps += Math.abs(deltaX) + Math.abs(deltaY)
    }
    return steps
}

module.exports.handle = async (session, buffer) => {
    const targetX = buffer.readUInt16BE()
    const targetY = buffer.readUInt16BE()

    let [cx, cy] = [session.player.x, session.player.y]
    const steps = createSteps(cx, cy, targetX, targetY)

    session.player.walkQueue.length = 0
    session.player.walkQueue.push(...steps)

    cx = targetX
    cy = targetY

    const additionalSteps = buffer.remaining() / 2

    for (let i = 0; i < additionalSteps; i += 1) {
        const dx = buffer.readInt8()
        const dy = buffer.readInt8()

        session.player.walkQueue.push(
            ...createSteps(cx, cy, targetX + dx, targetY + dy))

        cx = targetX + dx
        cy = targetY + dy
    }
}
