// entities contained within the entire world. this assigns indexes to new
// entities and provides optimized accessor methods using a quadtree

const { QuadTree, Box } = require('js-quadtree');

class EntityList {
    constructor(width, height) {
        this.entities = [];
        this.length = 0;

        this.quadTree = new QuadTree(new Box(0, 0, width, height), {
            capacity: 16
        });
    }

    add(entity) {
        this.quadTree.insert(entity);
        this.length += 1;

        for (let i = 0; i < this.entities.length; i += 1) {
            if (!this.entities[i]) {
                entity.index = i;
                this.entities[i] = entity;
                return i;
            }
        }

        const index = this.entities.push(entity) - 1;
        entity.index = index;
        return index;
    }

    remove(entity) {
        this.entities[entity.index] = null;
        this.quadTree.remove(entity);
        this.length -= 1;
    }

    *getAll() {
        for (const entity of this.entities) {
            if (entity !== null) {
                yield entity;
            }
        }
    }

    getByIndex(index) {
        return this.entities[index];
    }

    getInArea(x, y, range) {
        x -= Math.floor(range / 2);
        y -= Math.floor(range / 2);

        return this.quadTree.query(new Box(x, y, range, range));
    }

    getAtPoint(x, y) {
        return this.quadTree.query(new Box(x, y, 0, 0));
    }

    *getAllByID(id) {
    }

    getByID(id) {
    }
}

module.exports = EntityList;
