module.exports = player => {
    let msg = '@gre@Current Instances % % '
    player.session.server.instances.forEach(instance => {
        msg += `@yel@${instance.name} % `
    })
    player.session.send.serverMessage(msg)
}
