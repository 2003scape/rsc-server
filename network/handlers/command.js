const commandHandlers = require('./command-handlers')

module.exports = async (session, buffer) => {
    const [command, ...args] = buffer.toString().split(' ')

    const handler = commandHandlers.get(command.toLowerCase())

    if (handler) {
        handler(session.player, ...args)
    } else {
        session.send.message(`invalid command: ${command.toLowerCase()}`)
    }
}
