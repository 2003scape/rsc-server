const fs = require('fs')
const path = require('path')
const packets = require('../opcodes').client

const handlers = new Map()

fs.readdirSync(__dirname).forEach(file => {
    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return
    }

    const handler = require(path.join(__dirname, file))

    if (handler && packets.hasOwnProperty(handler.name)) {
        const packetId = packets[handler.name]

        if (handlers.has(packetId)) {
            console.warn(`warning: duplicate handler for ${handler.name}`)
        }

        handlers.set(packetId, handler.handle)
    }
})

module.exports = handlers
