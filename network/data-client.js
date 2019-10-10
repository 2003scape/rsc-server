const fs = require('fs')
const net = require('net')
const tls = require('tls')
const JsonSocket = require('json-socket')

class DataClient {
    constructor(config) {
        const Socket = config.client.ssl ? tls.TLSSocket : net.Socket

        this.config = config
        this.socket = new JsonSocket(new Socket())
    }
    async connect() {
        return new Promise((resolve, reject) => {
            try {
                let opts = this.config.client.options

                if (this.config.client.ssl) {
                    const sslOpts = {
                        key: fs.readFileSync(this.config.client.ssl.key),
                        cert: fs.readFileSync(this.config.client.ssl.cert),
                        ca: fs.readFileSync(this.config.client.ssl.ca)
                    }

                    opts = { ...opts, ...sslOpts }
                }

                this.socket.connect(opts, resolve)

                this.socket.on('message', message => {
                    if (message.command === 'ping') {
                        console.log(`Got ping: ${Date.now()}`)
                        this.socket.sendMessage({ command: 'pong' })
                    }
                })
            } catch (error) {
                reject(error)
            }
        })
    }
    async disconnect() {
        if (this.client) {
            this.client.destroy()
        }
    }
    async write(json) {

    }
}

module.exports = DataClient
