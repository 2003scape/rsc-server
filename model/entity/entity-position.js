const EVENT_ENTITY_REORIENTED = 0
const EVENT_ENTITY_REMOVED = 1

class EntityPosition {
    constructor() {
        this.unknown = new Set()
        this.known = new Set()
        this.events = {}
    }
    knows(entity) {
        return this.known.has(entity)
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
        // the client doesn't know about this entity yet, so it's
        // safe to just remove it without notifying the client
        if (this.unknown.has(entity)) {
            this.unknown.delete(entity)
            return
        }

        // we care if an entity was deleted from known entities.
        // however, if an entity was unknown, and we delete it,
        // there's no point in telling the client to remove it
        if (!this.known.has(entity)) {
            return
        }

        // TODO: for some reason this isn't being preserved when
        // it comes time to send the region update...
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
        const update = this.events[entity.index]

        if (update && update.type == EVENT_ENTITY_REMOVED) {
            Reflect.deleteProperty(this.events, entity.index)
        }
        this.unknown.add(entity)
    }
    acknowledge(entity) {
        const wasUnknown = this.unknown.delete(entity)
        const update = this.events[entity.index]

        if (entity.index === -1) {
            // not sure why EVENT_ENTITY_REMOVED isn't being preserved..
            this.known.delete(entity)
            Reflect.deleteProperty(this.events, entity.index)
        }

        if (update) {
            if (update.type === EVENT_ENTITY_REMOVED) {
                this.known.delete(entity)
            }
            Reflect.deleteProperty(this.events, entity.index)
        }

        if (wasUnknown) {
            this.known.add(entity)
        }
    }
}

module.exports = EntityPosition
