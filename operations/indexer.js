class Indexer {
    constructor() {
        this.list = []
        this.open = []
    }
    request() {
        if (this.open.length === 0) {
            // If the open list is empty, no gaps in the index list have been created
            // yet, so push an index to the end
            const index = this.list.length
            this.list.push(index)
            return index
        } else {
            // Since the open list isn't empty, there are gaps in the array that we
            // need to fill with the values of the open list. Shift a position off of
            // the the open list and fill the gap in the entity list.
            const index = this.open.shift()
            this.list.splice(index, 0, index)
            return index
        }
    }
    release(index) {
        const removeIndex = this.list.indexOf(index)
        if (removeIndex !== -1) {
            this.list.splice(removeIndex, 1)
        } else {
        }
        this.open.push(index)
    }
}

module.exports = Indexer
