const bulk = require('bulk-require')

const handlers = new Map(Object.entries(bulk(__dirname, ['*.js'])))
handlers.delete('index')

module.exports = handlers
