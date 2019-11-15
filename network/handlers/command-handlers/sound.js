module.exports = (player, soundName) => {
    if (!soundName) {
        return player.send.message('usage: ::sound <name>')
    }

    player.session.send.sound(soundName)
}
