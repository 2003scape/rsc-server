class Indexer {
    constructor() {
        this.list = []
        this.open = []
    }
    request() {
        if (this.indicies.open.length === 0) {
            const index = this.list.length
            this.list.push(index)
            return index
        } else {
            const index = this.open.shift()
            this.list[index] = index
            return index
        }
    }
    release(index) {
        const listIndex = this.list.indexOf(index)
        if (listIndex !== -1) {
            this.list.splice(listIndex, 1)
            this.open.push(index)
        }
    }
}

module.exports = Indexer
