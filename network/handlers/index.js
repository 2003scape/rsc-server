const bulk = require('bulk-require');
const packets = require('../opcodes').client

const handlers = new Map(Object.entries(bulk(__dirname, ['*.js'])))
const mappedHandlers = new Map()

handlers.delete('index')

for (const [key, handler] of handlers.entries()) {
    if (Reflect.has(packets, key)) {
        mappedHandlers.set(packets[key], handler)
    } else {
        console.warn(`unknown packet handler: ${key}`)
    }
}

module.exports = mappedHandlers
