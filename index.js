const config = require('./config')
const pkg = require('./package')
const Server = require('./network/server')
const locations = require('./locations')

async function main() {
    try {
        console.log(`starting server..`)

        const server = new Server(config)

        locations.initialize(server)

        console.log(` - registered ${server.world.objectTree.getAllPoints().length} game objects`)
        console.log(` - registered ${server.world.wallDecorTree.getAllPoints().length} wall objects`)

        await server.bind()

        console.log(`${pkg.name} is online at`, server.socket.address())
    } catch (error) {
        console.error(error)
    }
}

(async () => main())()
