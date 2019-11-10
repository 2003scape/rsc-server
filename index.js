const Server = require('./network/server')
const config = require('./config')
const locations = require('./locations')
const pkg = require('./package')

async function main() {
    try {
        console.log('starting server...')

        const server = new Server(config)

        server.on('error', e => console.error(e))

        locations.initialize(server)

        console.log(' - registered ' +
            `${server.world.objectTree.getAllPoints().length} game objects`)
        console.log(' - registered ' +
            `${server.world.wallDecorTree.getAllPoints().length} wall objects`)

        await server.start()

        console.log(`${pkg.name} is listening for tcp connections at`,
            server.socket.address())

        if (config.websocketServer.port > 0) {
            console.log(`${pkg.name} is listening for websocket connections at`,
                server.websocket.address())
        }
    } catch (e) {
        process.exitCode = 1
        console.error('fatal error initializing server', e)
    }
}

(async () => main())()
