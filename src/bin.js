#!/usr/bin/env node

const Server = require('./server');
const bole = require('bole');
const fs = require('fs').promises;
const pkg = require('../package');
const process = require('process');
const yargs = require('yargs');

const log = require('bole')('bin');

const argv = yargs
    .scriptName('rsc-server')
    .alias('h', 'help')
    .option('c', {
        alias: 'config',
        type: 'string',
        describe: 'use a specific config.json file',
        default: './config.json'
    })
    .option('v', {
        alias: 'verbose',
        type: 'string',
        describe: 'the logging verbosity level',
        default: 'info',
        choices: ['debug', 'info', 'warn', 'error']
    })
    .version(pkg.version).argv;

bole.output({
    level: argv.verbose,
    stream: process.stdout
});

(async () => {
    let config;

    try {
        config = JSON.parse(await fs.readFile(argv.config));
    } catch (e) {
        process.exitCode = 1;
        log.error(e);
        return;
    }

    const server = new Server(config);
    await server.init();
})();
