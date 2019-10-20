module.exports.name = 'env'

module.exports.handle = player => {
    let msg = `@gre@Environment % %`
    msg += `@whi@instance=@yel@${player.instance.name} @whi@, position=@yel@(${player.x}, ${player.y}) % `
    msg += `@whi@players={`
    for (const p of player.instance.players) {
        msg += `@yel@${p.username} @whi@, `
    }
    msg = msg.substr(0, msg.length - 2)
    msg += '}'
    player.send.serverMessage(msg)
}
