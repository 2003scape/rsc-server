// Load each file in the directory as a packet sender and return a map in the
// format of ` { name: sender } `. `name` being the name we choose in the file
// and `sender` being the function to assemble the packet. The `builder`
// function accepts at least one argument, being `session`.
const fs = require('fs')
const path = require('path')

// The JSON file mapping names to opcodes
const packets = require('../opcodes').server
const senders = {}

fs.readdirSync(__dirname).forEach(file => {
    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return
    }
    const sender = require(path.join(__dirname, file))

    if (sender && packets.hasOwnProperty(sender.name)) {
        senders[sender.name] = sender.send
    }
})

module.exports = function (session) {
    const send = {}

    Object.keys(senders).forEach(name => {
        const sender = senders[name]

        send[name] = sender(session, packets[name])
    })

    return send
}
