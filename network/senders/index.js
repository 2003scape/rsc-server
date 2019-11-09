const bulk = require('bulk-require')
const packets = require('../opcodes').server

const senders = new Map(Object.entries(bulk(__dirname, ['*.js'])))
const renamedSenders = new Map()

senders.delete('index')

// convert the snake-case keys in the JSON to camelCase for our methods
function toCamel(str) {
    return str.replace(/([-_][a-z])/ig, $1 => $1.toUpperCase().replace('-', ''))
}

for (const [key, send] of senders) {
    renamedSenders.set(toCamel(key), {
        id: packets[key],
        sender: send
    })
}

module.exports = session => {
    const send = {}

    // nice, double unpacking.
    for (let [name, { id, sender }] of renamedSenders) {
        send[name] = sender.bind(null, session, id)
    }

    return send
}
