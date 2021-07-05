const Server = require('./server');
const bole = require('bole');

(async () => {
    bole.output({
        level: 'debug',
        stream: {
            write: (buffer) => console.log(buffer.toString())
        }
    });

    addEventListener('message', async (e) => {
        switch (e.data.type) {
            case 'start': {
                const server = new Server(e.data.config);
                await server.init();
                postMessage({ type: 'ready' });

                break;
            }
        }
    });
})();
