const fs = require('fs')
const path = require('path')

const handlers = new Map()

fs.readdirSync(__dirname).forEach(file => {
    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return
    }

    const handler = require(path.join(__dirname, file))

    if (handler) {
        if (handlers.has(handler.name)) {
            console.warn(`warning: command handler for ${handler.name}`)
        }

        // we have to convert the keys in server.json to camelCase,
        // otherwise we wouldn't be able to call our functions.. like functions
        handlers.set(handler.name.toLowerCase(), handler.handle)
    }
})

module.exports = handlers
