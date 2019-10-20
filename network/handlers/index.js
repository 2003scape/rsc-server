const plugin = require('../../operations/plugin')
const packets = require('../opcodes').client

// eslint-disable-next-line no-undef
const handlers = plugin.loadMap(__dirname, true)
const mappedHandlers = new Map()

for (const [key, handler] of handlers.entries()) {
    if (Reflect.has(packets, key)) {
        mappedHandlers.set(packets[key], handler)
    } else {
        console.warn(`unknown packet handler: ${key}`)
    }
}

module.exports = mappedHandlers
