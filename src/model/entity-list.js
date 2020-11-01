// entities contained within the entire world. this assigns indexes to new
// entities and provides optimized accessor methods using a quadtree

const { QuadTree, Box } = require('js-quadtree');
//const QuadTree = require('quadtree-lib');

class EntityList {
    constructor(width, height) {
        this.entities = [];
        this.length = 0;

        this.quadTree = new QuadTree(new Box(0, 0, width, height), {
            capacity: 64,
            arePointsEqual: (point1, point2) => {
                return (
                    point1.index === point2.index &&
                    point1.x === point2.x &&
                    point1.y === point2.y
                );
            }
        });

        //this.quadTree = new QuadTree({ width, height });
    }

    add(entity) {
        this.quadTree.insert(entity);
        //this.quadTree.push(entity, true);
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
        // make sure this is the same entity that was here before, in case
        // we try to remove the same instance twice.
        if (this.entities[entity.index] !== entity) {
            return;
        }

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
        /*return this.quadTree.colliding({
            x,
            y,
            width: range,
            height: range
        });*/
    }

    getAtPoint(x, y) {
        return this.quadTree.query(new Box(x, y, 0, 0));
        //return this.quadTree.colliding({ x, y });
    }

    *getAllByID(id) {
        for (const entity of this.entities) {
            if (entity.id === id) {
                yield entity;
            }
        }

        return [];
    }

    getByID(id) {
        const [entity] = this.getAllByID(id);
        return entity;
    }
}

module.exports = EntityList;
