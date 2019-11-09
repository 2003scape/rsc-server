module.exports.name = 'env'

module.exports.handle = player => {
    let msg = `@gre@Environment % %@whi@instance=@yel@${player.instance.name}` +
        `@whi@, position=@yel@(${player.x}, ${player.y}) % @whi@players={`

    for (const p of player.instance.players) {
        msg += `@yel@${p.username} @whi@, `
    }

    msg = `${msg.substr(0, msg.length - 2)}}`

    player.send.serverMessage(msg)
}
