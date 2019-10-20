class Indexer {
    constructor() {
        this.indicies = {
            list: [],
            open: []
        }
    }
    request() {
        if (!this.indicies.open.length) {
            // If the open list is empty, no gaps in the index list have been created
            // yet, so push an index to the end
            const index = this.indicies.list.length
            this.indicies.list.push(index)
            return index
        } else {
            // Since the open list isn't empty, there are gaps in the array that we
            // need to fill with the values of the open list. Shift a position off of
            // the the open list and fill the gap in the entity list.
            const index = this.indicies.open.shift()
            this.indicies.list[index] = index
            return index
        }
    }
    release(index) {
        Reflect.deleteProperty(this.incudies, index)
        this.indicies.open.push(index)
    }
}

module.exports = Indexer
