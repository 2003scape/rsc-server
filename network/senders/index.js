const plugin = require('../../operations/plugin')
const packets = require('../opcodes').server

// eslint-disable-next-line no-undef
const senders = plugin.loadMap(__dirname, false, 'send')
const renamedSenders = new Map()

const toCamel = str => str.replace(/([-_][a-z])/ig,
    $1 => $1.toUpperCase().replace('-', ''))

for (const [key, send] of senders) {
    renamedSenders.set(toCamel(key), {
        id: packets[key],
        sender: send
    })
}

module.exports = session => {
    const send = {}

    // nice, double unpacking.
    for (let [name, { id: id, sender: sender }] of renamedSenders) {
        send[name] = sender.bind(null, session, id)
    }

    return send
}
