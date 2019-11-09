const bulk = require('bulk-require')

let listeners = bulk(__dirname, ['*.js'])
Reflect.deleteProperty(listeners, 'index')

listeners = new Set(Object.values(listeners))

module.exports = player => {
    for (const listener of listeners) {
        listener(player)
    }
}
