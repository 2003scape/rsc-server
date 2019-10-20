const plugin = require('../../../operations/plugin')

const listeners = plugin.loadSet(__dirname)

module.exports = gameObject => {
    for (const listener of listeners) {
        listener(gameObject)
    }
}
