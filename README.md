# rsc-server
a runescape classic game server emulator written in javascript. designed for the
original [204 revision](https://github.com/2003scape/mudclient204) in java and
for the [204 web client](https://github.com/2003scape/rsc-client) via
websockets.

## install

    $ npm install rsc-server

## usage
edit `config.json` and run:

    $ npm start

## file layout
* `./config.json`
    * details on how to configure the game world and network communications
* `./definitions/`
    * JSON files describing properties of objects, items (and their attributes),
NPCs, etc.
* `./locations/`
    * JSON files describing where objects, items and NPCs are located in the
    game world
* `./model/`
    * game world abstractions and their implementations
* `./network/`
    * communication between the client and server
    * `./handlers/`
        * implementations of server/client communication (packet building and
        parsing)
    * `./opcodes/`
        * JSON files with [opcode](https://en.wikipedia.org/wiki/Opcode)
        (packet ID) maps
* `./operations/`
    * various runescape-related algorithm implementations such as username
    encoding and encryption

## license
Copyright (C) 2019  2003Scape Team

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
