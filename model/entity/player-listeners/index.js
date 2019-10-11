const fs = require('fs')
const path = require('path')

const listeners = new Set()

fs.readdirSync(__dirname).forEach(file => {
    if (file === path.basename(__filename) || !/\.js$/.test(file)) {
        return
    }

    const listener = require(path.join(__dirname, file))

    if (listener) {
        listeners.add(listener)
    }
})

module.exports = player => {
    for (const listener of listeners) {
        listener(player)
    }
}
