class Instance {
    constructor(server, disposeWhenEmpty) {
        this.server = server
        this.disposeWhenEmpty = disposeWhenEmpty
        this.players = new Set()

        this.server.instances.add(this)
    }
    addPlayer(player) {
        this.players.add(player)
        player.instance = this
    }
    removePlayer(player) {
        this.players.delete(player)
        player.instance = null
    }
    update() {
        console.log(`updating instance: ${this.constructor.name}`)

        for (let player of this.players) {
            player.update()
        }
    }
}

module.exports = Instance
