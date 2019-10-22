class GameObjectPositionUpdater {
    constructor() {
        this.newObjects = new Set()
        this.knownObjects = new Set()
        this.removedObjects = new Set()
    }
    intersection(objects) {
        const difference = new Set(this.knownObjects)
        let modified = false

        for (const object of objects) {
            if (this.knownObjects.has(object)) {
                difference.delete(object)
            } else {
                this.newObjects.add(object)
                modified = true
            }
        }
        for (const object of difference) {
            this.knownObjects.delete(object)
            this.removedObjects.add(object)
            modified = true
        }

        return modified
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
    update() {
        this.newObjects.forEach(object => this.knownObjects.add(object))
        this.newObjects.clear()
        this.removedObjects.clear()
    }
}

module.exports = GameObjectPositionUpdater
