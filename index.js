const config = require('./config')
const Server = require('./network').Server

async function main() {
    const host = config.server.host || '0.0.0.0'
    const port = config.server.port || 43594
    const maxConnections = config.server.maxConnections || 0

    const server = new Server(maxConnections)

    server.on('session-connected', session => {
        console.log(`${session} connected`)
    })
    server.on('session-disconnected', session => {
        console.log(`${session} disconnected`)
    })
    server.on('session-timeout', session => {
        console.log(`${session} timed out`)
        session.close()
    })
    server.on('session-error', (session, error) => {
        console.error(`error in ${session}: ${error}`)
        session.close()
    })

    try {
        await server.bind(port, host)
        console.log(`server is online at ${host}:${port}`)
    } catch (error) {
        console.error(`error binding server: ${error}`)
    }
}

(async () => await main())()
