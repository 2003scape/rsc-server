# rsc-server
[runescape classic](https://classic.runescape.wiki/w/RuneScape_Classic) mmorpg
game server emulator. designed to work with the web-based
[rsc-client](https://github.com/2003scape/rsc-client) or the java-based
[mudclient204](https://github.com/2003scape/mudclient204).

## install

* download and install [nodejs](https://nodejs.org/en/) (which comes with
[npm](https://docs.npmjs.com/about-npm))

* for the latest stable release, run:

        # npm install -g @2003scape/rsc-data-server @2003scape/rsc-server

* to check out the latest unstable features, install
[git](https://git-scm.com/downloads) and run:

        $ git clone https://github.com/2003scape/rsc-data-server
        $ cd rsc-data-server && npm install
        $ git clone https://github.com/2003scape/rsc-server
        $ cd ../rsc-server && npm install

* install
[rsc-client](https://github.com/2003scape/rsc-client#install) or
[mudclient204](https://github.com/2003scape/mudclient204#build-and-run)

## cli usage
rsc-server connects to
[rsc-data-server](https://github.com/2003scape/rsc-data-server) for database
saving/loading and managing friends lists across worlds. it supports TCP with
TLS or IPC [domain sockets](https://en.wikipedia.org/wiki/Unix_domain_socket).

* if installed with npm, use (`-c <config-file>` is optional for both,
they will look for *config.json* in their own directory first):

        $ rsc-data-server -c /etc/rsc-data-server/config.json &
        $ rsc-server -c /etc/rsc-server/config.json

* if cloned from git:

        $ cd rsc-data-server && npm start &
        $ cd ../rsc-server && npm start

## config.json
when using `$ rsc-server`, pass in `-c <config-file>` (or edit `config.json`
in the *rsc-server* directory if cloned from git) to modify the following:

```javascript
{
    // UNIX socket file used if connecting to rsc-data-server on the same
    // machine
    "dataServerFile": "/tmp/rsc-data-server.sock",

    // optional IP/port if connecting to rsc-data-server on another network
    "dataServerTCP": "localhost:9001" || null,

    // password used to authenticate with rsc-data-server
    "dataServerPassword": "test",

    // version to check clients on login
    "version": 204,

    // the unique world index to communicate to rsc-data-server
    "worldID": 1,

    // port to listen to for non-websocket regular TCP clients
    // (for mudclient204)
    "tcpPort": 43594,

    // port to listen to https://en.wikipedia.org/wiki/WebSocket connections
    // (for rsc-client)
    "websocketPort": 43595,

    // country flag to use on the website
    "country": "CAN",

    // disable members features and non-members logins & registration for this
    // world
    "members": false,

    // boost or lower the experience rate
    "experienceRate": 1,

    // enable or disable fatigue gaining
    "fatigue": true,

    // add from/to bank options for certing NPCs (not supported in real RSC)
    "bankCertificates": false,

    // store player combat style in database (not supported in real RSC)
    "rememberCombatStyle": false
}
```

## see also
* [RSCGo](https://github.com/spkaeros/RSCGo) by @spkaeros
    * runescape classic server written in go
* [RuneJS](https://github.com/rune-js)
    * runescape 2 server written in javascript
* [RuneScape Classic Wiki](https://classic.runescape.wiki/)
    * best source of accurate runescape classic data

## license
Copyright (C) 2020  2003Scape Team

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
