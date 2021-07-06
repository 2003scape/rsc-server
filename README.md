# rsc-server
[runescape classic](https://classic.runescape.wiki/w/RuneScape_Classic)
private server mmorpg emulator. designed to work with the web-based
[rsc-client](https://github.com/2003scape/rsc-client) or the java-based
[mudclient204](https://github.com/2003scape/mudclient204).

features:
 * supports TCP and WebSockets via Node.js with SQLite persistence and multiple
 worlds (with [rsc-data-server](https://github.com/2003scape/rsc-data-server)),
 and single-page with optional
 multiplayer on the browser via WebWorkers and WebRTC
 * [plugin-based content addition](https://github.com/2003scape/rsc-server/tree/master/src/plugins).
 add files with certain function signatures (
 `function onTalkToNpc(player, npc) {}`,
 `function onUseWithInventory(player, item, target) {}`, etc.) to implement
 quests, skills, item interactions, and other game content
 * [simple, JSON-based data formats for spawns, skills, probabilities, etc.](https://github.com/2003scape/rsc-data)
 * NPC combat (melee and ranged) with accurate
 [roll-based RNG drops](https://github.com/2003scape/rsc-data/blob/master/rolls/drops.json)
 are implemented
 * [all of the free-to-play quests implemented](https://github.com/2003scape/rsc-server/tree/master/src/plugins/quests/free)
 * [accurate sleep captcha](https://github.com/2003scape/rsc-captcha)
 * [compatible with period-accurate website replica](https://github.com/2003scape/rsc-www)

## install

* download and install [Node.js](https://nodejs.org/en/) (which comes with
[npm](https://docs.npmjs.com/about-npm))

* for the latest stable release, run:

      # npm install -g @2003scape/rsc-data-server @2003scape/rsc-server

* to check out the latest unstable features, install
[git](https://git-scm.com/downloads) and run:

      $ git clone https://github.com/2003scape/rsc-data-server
      $ cd rsc-data-server && npm install && cd ../
      $ git clone https://github.com/2003scape/rsc-server
      $ cd rsc-server && npm install

* if you are having npm build issues, you may require additional packages.
visit the [node-canvas](https://github.com/Automattic/node-canvas#compiling)
github for more information

* install
[rsc-client](https://github.com/2003scape/rsc-client#install) or
[mudclient204](https://github.com/2003scape/mudclient204#build-and-run) to login

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

## browser usage
create a new `Worker` instance using
`./dist/server.bundle.js` or `./dist/server.bundle.min.js`. if making any
changes to the source, use `$ npm run build-browser` to re-build these files.
you can then pass the worker instance into
[mudclient's](https://github.com/2003scape/rsc-client) `.server` property.

```javascript
const serverWorker = new Worker('./server.bundle.min.js');

serverWorker.postMessage({
    type: 'start',
    config: {
        worldID: 1,
        version: 204,
        members: false,
        experienceRate: 1,
        fatigue: true,
        rememberCombatStyle: false
    }
});

// mc.server = serverWorker;
```

## commands

|Command|Description|
|-|-|
|::addexp \<skill\> \<experience\>|Add experience to a skill name.|
|::appearance|Toggle the character creation screen.|
|::bank|Open the bank interface.|
|::bubble \<id\>|Create a player action bubble with an item ID.|
|::clearinventory|Clear your inventory items.|
|::coords|Display your current coordinates.|
|::dmg \<amount\>|Remove a certain amount of current hitpoints.|
|::fatigue|Set your fatigue to 100%.|
|::give \<username\> \<id\> \<amount = 1\>|Spawn an item in someone else's (online) inventory with optional amount.|
|::goto \<username\>|Teleport to a username (online).|
|::gotoentity \<type\> \<id\>|Teleport to the first entity (npcs, gameObjects, groundItems) of a certain ID.|
|::item \<id\> \<amount = 1\>|Spawn an item in your inventory with optional amount.|
|::kick \<username\>|Forcefully log out a username (online).|
|::npc \<id\>|Spawn an NPC in your current position.|
|::setqp \<amount\>|Set your quest points to a certain amount.|
|::shop \<name\>|Open a shop by name (see [rsc-data/shops.json](https://github.com/2003scape/rsc-data/blob/master/shops.json))|
|::sound \<name\>|Play a sound file (members client only, see [rsc-sounds/sounds1.json](https://github.com/2003scape/rsc-sounds/blob/master/sounds1.json)).|
|::step \<deltaX\> \<deltaY\>|Step in a certain direction (delta can be -1, 0 or 1).
|::teleport \<x\> \<y\> \| \<region\>|Teleport to an x, y coordinate or region name (see [rsc-data/regions.json](https://github.com/2003scape/rsc-data/blob/master/regions.json)).|

## config
when using `$ rsc-server`, pass in `-c <config-file>` (or edit `config.json`
in the *rsc-server* directory if cloned from git), or change the object
passed into the `{ type: 'start' }` Worker message to modify the following
settings:

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

    // port to listen to https://developer.mozilla.org/en-US/docs/Web/API/WebSocket connections
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
* [RuneJS](https://github.com/runejs)
    * runescape 2 server written in javascript
* [RuneScape Classic Wiki](https://classic.runescape.wiki/)
    * best source of accurate runescape classic data

## license
Copyright (C) 2021  2003Scape Team

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
