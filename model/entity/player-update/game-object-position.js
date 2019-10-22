class GameObjectPositionUpdater {
    constructor() {
        this.newObjects = new Set()
        this.knownObjects = new Set()
        this.removedObjects = new Set()
    }
    intersection(objects) {
        const difference = new Set(this.knownObjects)

        for (const object of objects) {
            if (this.knownObjects.has(object)) {
                difference.delete(object)
            } else {
                this.newObjects.add(object)
            }
        }
        for (const object of difference) {
            const wasRemoved = this.knownObjects.delete(object)

            if (wasRemoved) {
                this.removedObjects.add(object)
            }
        }

        return this.newObjects.size > 0 || this.removedObjects.size > 0
    }
    add(object) {
        if (this.knownObjects.has(object)) {
            return
        }
        const wasRemoved = this.removedObjects.delete(object)

        if (!wasRemoved) {
            this.newObjects.add(object)
        }
    }
    remove(object) {
        if (this.newObjects.delete(object)) {
            return
        }
        const wasRemoved = this.knownObjects.delete(object)
        
        if (wasRemoved) {
            this.removedObjects.add(object)
        }
    }
    acknowledge(object) {
        const wasNew = this.newObjects.delete(object)

        if (wasNew) {
            return this.knownObjects.add(object)
        }

        this.removedObjects.delete(object)
    }
    update() {
        this.newObjects.forEach(object => this.knownObjects.add(object))
        this.newObjects.clear()
        this.removedObjects.clear()
    }
}

module.exports = GameObjectPositionUpdater
