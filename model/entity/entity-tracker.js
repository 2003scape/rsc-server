const EVENT_ENTITY_REORIENTED = 0
const EVENT_ENTITY_REMOVED = 1

class EntityTracker {
    constructor() {
        this.unknown = new Set()
        this.known = new Set()
        this.events = {}
    }
    reorient(entity) {
        if (!this.known.has(entity)) {
            return
        }
        this.events[entity.index] = {
            type: EVENT_ENTITY_REORIENTED,
            value: entity.direction,
            bits: 3
        }
    }
    remove(entity) {
        // we care if an entity was deleted from known entities.
        // however, if an entity was unknown, and we delete it,
        // there's no point in telling the client to remove it
        if (!this.known.has(entity)) {
            return
        }
        this.events[entity.index] = {
            type: EVENT_ENTITY_REMOVED,
            value: 12,
            bits: 4
        }
    }
    add(entity) {
        if (this.unknown.has(entity) || this.known.has(entity)) {
            return
        }
        if (this.events[entity.index]) {
            delete this.events[entity.index]
        }
        this.unknown.add(entity)
    }
    acknowledge(entity) {
        const wasUnknown = this.unknown.delete(entity)
        const update = this.events[entity.index]

        if (update) {
            if (update.type === EVENT_ENTITY_REMOVED) {
                this.known.delete(entity)
            }
            delete this.events[entity.index]
        }

        if (wasUnknown) {
            this.known.add(entity)
        }
    }
}

module.exports = EntityTracker
