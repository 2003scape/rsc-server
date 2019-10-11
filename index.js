const config = require('./config')
const pkg = require('./package')
const Server = require('./network/server')

async function main() {
    try {
        const server = new Server(config)

        await server.bind()

        console.log(`${pkg.name} is online at`, server.socket.address())
    } catch (error) {
        console.error(error)
    }
}

(async () => await main())()
