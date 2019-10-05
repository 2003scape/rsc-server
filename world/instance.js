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

function addEntity(tree, entity) {
    const { x: x, y: y } = entity.position
    let tile = tree.find(x, y, 1)

    if (tile) {
        tile.list.add(entity)
    } else {
        tile = { position: entity.position, list: new Set([entity]) }
        tree.add(tile)
    }
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
    constructor() {
        this.players = quadtree.quadtree().x(x).y(y)
        this.npcs = quadtree.quadtree().x(x).y(y)
        this.objects = quadtree.quadtree().x(x).y(y)

        this.addPlayer = addEntity.bind(null, this.players)
        this.removePlayer = removeEntity.bind(null, this.players)
        this.getPlayers = getEntities.bind(null, this.players)

        this.addNpc = addEntity.bind(null, this.npcs)
        this.removeNpc = removeEntity.bind(null, this.npcs)
        this.getNpcs = getEntities.bind(null, this.npcs)

        this.addObject = addEntity.bind(null, this.objects)
        this.removeObject = removeEntity.bind(null, this.objects)
        this.getObjects = getEntities.bind(null, this.objects)
    }
}

module.exports = Instance
