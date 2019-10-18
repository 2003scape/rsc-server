const RBush = require('rbush')

function insert(tree, entity) {
    tree.insert({
        minX: entity.position.x,
        maxX: entity.position.x,
        minY: entity.position.y,
        maxY: entity.position.y,
        entity: entity
    })
}

function remove(tree, entity) {
    tree.remove(entity, (a, b) => a.index === b.index)
}

class Instance {
    constructor(server, disposeWhenEmpty) {
        this.server = server
        this.disposeWhenEmpty = disposeWhenEmpty
        this.players = new Set()
        this.playersRequiringMovement = new Set()
        this.playerTree = new RBush(16)

        this.server.instances.add(this)
    }
    addPlayer(player) {
        insert(this.playerTree, player)
        this.players.add(player)
        player.instance = this
    }
    removePlayer(player) {
        remove(this.playerTree, player)
        this.players.delete(player)
        player.instance = null
    }
    getPlayers(position, distance = 15) {
        return this.playerTree.search({
            minX: position.x - distance,
            maxX: position.x + distance,
            minY: position.y - distance,
            maxY: position.y + distance
        }).map(result => result.entity)
    }
    playerMoved(player) {
        this.playersRequiringMovement.add(player)
    }
    update() {
        // this... i don't like this. but it will work for now.
        for (let player of this.playersRequiringMovement) {
            remove(this.playerTree, player)
            insert(this.playerTree, player)
        }
        this.playersRequiringMovement.clear()

        for (let player of this.players) {
            player.update()
        }
    }
}

module.exports = Instance
