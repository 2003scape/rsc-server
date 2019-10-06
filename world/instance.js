const quadtree = require('d3-quadtree')

// entities will be stores in the quadtree at (x,y) coordinates
// using lists, since quadtrees only support 1 element
// at a given coordinate

function x(tile) {
    return tile.position.x
}

function y(tile) {
    return tile.position.y
}

function addEntity(tree, entity, maxSize) {
    if (tree.size() >= maxSize) {
        return false
    }

    const { x: x, y: y } = entity.position
    let tile = tree.find(x, y, 1)

    if (tile) {
        tile.list.add(entity)
    } else {
        tile = { position: entity.position, list: new Set([entity]) }
        tree.add(tile)
    }

    return true
}

function removeEntity(tree, entity) {
    const { x: x, y: y } = entity.position
    const tile = tree.find(x, y, 1)

    if (tile) {
        tile.list.delete(entity)
    }
}

function getEntities(tree, position, radius) {
    const { x: x, y: y } = position
    const entities = new Set()
    const add = entities.add.bind(entities)

    for (let dy = y - radius; dy < y + radius; dy += 1) {
        for (let dx = x - radius; dx < x + radius; dx += 1) {
            const tile = tree.find(x, y, 1)

            if (tile) {
                tile.list.forEach(add)
            }
        }
    }

    return entities
}

class Instance {
    constructor(maximumPlayers, maximumNpcs, maximumObjects) {
        this.maximumPlayers = maximumPlayers
        this.maximumNpcs = maximumNpcs
        this.maximumObjects = maximumObjects
        this.players = quadtree.quadtree().x(x).y(y)
        this.npcs = quadtree.quadtree().x(x).y(y)
        this.objects = quadtree.quadtree().x(x).y(y)
    }

    addPlayer(player) {
        console.log(`added ${player.username} to instance`)
        return addEntity(this.players, player, this.maximumPlayers)
    }

    removePlayer(player) {
        console.log(`removed ${player.username} from instance`)
        removeEntity(this.players, player)
    }

    getPlayers(position, radius = 16) {
        getEntities(this.players, position, radius)
    }

    addNpc(npc) {
        return addEntity(this.npcs, npc, this.maximumNpcs)
    }

    removeNpc(player) {
        removeEntity(this.npcs, npc)
    }

    getNpcs(position, radius = 16) {
        getEntities(this.npcs, position, radius)
    }

    addObject(object) {
        return addEntity(this.objects, object, this.maximumObjects)
    }

    removeObject(object) {
        removeEntity(this.objects, object)
    }

    getObjects(position, radius = 16) {
        getEntities(this.objects, position, radius)
    }
}

module.exports = Instance
