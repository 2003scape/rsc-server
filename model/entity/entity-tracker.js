class EntityTracker {
    constructor() {
        this.unknown = new Set()
        this.known = new Set()

        this.adder = this.known.add.bind(this.known)
    }
    add(entity) {
        if (this.unknown.has(entity) || this.known.has(entity)) {
            return
        }
        this.unknown.add(entity)
    }
    remove(entity) {
        this.unknown.remove(entity)
        this.known.remove(entity)
    }
    update() {
        this.unknown.forEach(this.adder)
        this.unknown.clear()
    }
}

module.exports = EntityTracker
