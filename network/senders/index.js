const fs = require('fs')
const path = require('path')
const packets = require('../opcodes').server

const senders = new Map()

const toCamel = str => str.replace(/([-_][a-z])/ig,
    $1 => $1.toUpperCase().replace('-', ''))

fs.readdirSync(__dirname).forEach(file => {
    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return
    }

    const sender = require(path.join(__dirname, file))

    if (sender) {
        if (senders.has(sender.name)) {
            console.warn(`warning: duplicate sender for ${sender.name}`)
        }

        // we have to convert the keys in server.json to camelCase,
        // otherwise we wouldn't be able to call our functions.. like functions
        senders.set(toCamel(sender.name), {
            id: packets[sender.name],
            sender: sender.send
        })
    }
})

module.exports = session => {
    const send = {}

    // nice, double unpacking.
    for (let [name, { id: id, sender: sender }] of senders) {
        send[name] = sender.bind(null, session, id)
    }

    return send
}
