const config = require('./config')
const Server = require('./network').Server
const DataClient = require('./network/data-client')

async function main() {
    const host = config.server.host || '0.0.0.0'
    const port = config.server.port || 43594
    const maxConnections = config.server.maxConnections || 0

    const server = new Server(maxConnections)

    // we don't really need all of these...
    // TODO: cleanup Server class
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
        //await server.bind(port, host)
        console.log(`server is online at ${host}:${port}`)
    } catch (error) {
        console.error(`error binding server: ${error}`)
    }
}

async function main1() {
    console.log('starting')
    const client = new DataClient(config)

    await client.connect()
    console.log('client connected')
}

(async () => await main1())()
