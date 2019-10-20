module.exports.name = 'sysmsg'

module.exports.handle = (player, ...text) => {
    const msg = `SYSTEM MESSAGE: ${text.join(' ')}`

    for (const p of player.session.server.allPlayers()) {
        p.session.send.message(`@red@${msg}`)
        p.session.send.message(`@yel@${msg}`)
        p.session.send.message(`@gre@${msg}`)
        p.session.send.message(`@cya@${msg}`)
    }
}
