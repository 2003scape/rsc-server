const config = require('../../config')
const { QuadTree, Box } = require('js-quadtree')

const DEFAULT_BOUNDS = new Box(0, 0, config.world['plane-width'], config.world['plane-height'])

const TREE_CONFIG = {
    capacity: 16,
    removeEmptyNodes: true
}

function getEntities(tree, pos, dist) {
    const box = new Box(pos.x - ~~(dist / 2), pos.y - ~~(dist / 2), dist, dist)
    return tree.query(box)
}

class Instance {
    constructor(server, name, disposeWhenEmpty, bounds = DEFAULT_BOUNDS) {
        this.server = server
        this.name = name
        this.disposeWhenEmpty = disposeWhenEmpty

        this.players = new Set()
        this.playersRequiringMovement = new Set()
        this.playerTree = new QuadTree(bounds, TREE_CONFIG)

        this.objectTree = new QuadTree(bounds, TREE_CONFIG)
        this.wallDecorTree = new QuadTree(bounds, TREE_CONFIG)

        this.server.instances.add(this)
    }

    addPlayer(player) {
        this.playerTree.insert(player)
        this.players.add(player)
        player.instance = this
    }
    removePlayer(player) {
        this.playerTree.remove(player)
        this.players.delete(player)
        player.players.forget()
        player.inst = null
    }
    playerMoved(player) {
        this.playersRequiringMovement.add(player)
    }

    addObject(object) {
        this.objectTree.insert(object)
        object.instance = this
    }
    removeObject(object) {
        this.objectTree.remove(object)
        object.instance = null
    }

    addWallObject(object) {
        this.wallDecorTree.insert(object)
        object.instance = this
    }
    removeWallObject(object) {
        this.wallDecorTree.remove(object)
        object.instance = null
    }

    getPlayers(position, distance = 15) {
        return getEntities(this.playerTree, position, distance)
    }
    getObjects(position, distance = 35) {
        return getEntities(this.objectTree, position, distance)
    }
    getWallObject(position, distance = 35) {
        return getEntities(this.wallDecorTree, position, distance)
    }

    update() {
        for (let player of this.players) {
            player.update()
        }
        // this... i don't like this. but it will have to work for now.
        for (let player of this.playersRequiringMovement) {
            this.playerTree.remove(player)
            this.playerTree.insert(player)
        }
        this.playersRequiringMovement.clear()
    }
}

module.exports = Instance
