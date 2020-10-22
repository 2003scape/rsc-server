# rsc-server
runescape classic game server emulator. designed to work with the web-based
[rsc-client](https://github.com/2003scape/rsc-client) or the java-based
[mudclient204](https://github.com/2003scape/mudclient204).

## install

    # npm install -g @2003scape/rsc-data-server @2003scape/rsc-server

## cli usage
rsc-server connects to
[rsc-data-server](https://github.com/2003scape/rsc-data-server) for database
saving/loading and managing friends lists across worlds. it supports TCP with
TLS or IPC [domain sockets](https://en.wikipedia.org/wiki/Unix_domain_socket).

    $ rsc-data-server -c /etc/rsc-data-server/config.json &
    $ rsc-server -c /etc/rsc-server/config.json

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
