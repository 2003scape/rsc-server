const { EventEmitter } = require('events');

class BrowserSocket extends EventEmitter {
    constructor(id, ip = '127.0.0.1') {
        super();
        this.id = id;
        this.remoteAddress = ip;
    }

    write(data) {
        postMessage({
            id: this.id,
            type: 'data',
            data
        });
    }

    connect() {}

    destroy() {}

    end() {}

    setKeepAlive() {}

    setTimeout() {}
}

module.exports = BrowserSocket;
