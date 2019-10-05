// Load each of the files in this directory as a packet handler and return a map
// in the format of ` { id: handler } `. `id` being the opcode the client sends,
// mapped in `packets.json`, and `handler` being the function used to deal with
// it. The `handler` function accepts three parameters, `session`, `payload`
// and `done`.
const fs = require('fs')
const path = require('path')

// The JSON file mapping names to opcodes.
const packets = require('../opcodes').client
const handlers = {}

fs.readdirSync(__dirname).forEach(file => {
    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return
    }
    const handler = require(path.join(__dirname, file))

    if (handler && packets.hasOwnProperty(handler.name)) {
        handlers[packets[handler.name]] = handler.handle
    }
});

module.exports = handlers
