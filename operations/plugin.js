const fs = require('fs')
const path = require('path')

function load(directory, add) {
    for (const item of fs.readdirSync(directory)) {
        if (item !== path.basename('index.js') && /\.js$/.test(item)) {
            const mod = require(path.join(directory, item))
            add(mod)
        }
    }
}

module.exports.loadSet = directory => {
    const modules = new Set()

    load(directory, mod => modules.add(mod))

    return modules
}

module.exports.loadMap = (directory, ignoreCase = false, handler = 'handle') => {
    const modules = new Map()

    load(directory, mod => modules.set(ignoreCase ? mod.name.toLowerCase() : mod.name, mod[handler]))

    return modules
}
