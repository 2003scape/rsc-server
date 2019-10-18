const UpdateType = {
    OVERHEAD_ACTION: 0,
    CHAT_MESSAGE: 1,
    DAMAGE: 2,
    NPC_PROJECTILE: 3,
    PLAYER_PROJECTILE: 4,
    APPEARANCE: 5,
    PRIVILEGED_CHAT_MESSAGE: 6
}

class PlayerUpdate {
    static get Type() {
        return UpdateType
    }
    constructor() {
        this.updates = []
    }
    clear() {
        this.updates.length = 0
    }
    action(player, item) {
        this.updates.push({
            index: player.index,
            type: UpdateType.OVERHEAD_ACTION,
            item: item
        })
    }
    chat(player, message) {
        this.updates.push({
            index: player.index,
            type: UpdateType.CHAT_MESSAGE,
            message: message
        })
    }
    damage(player, damage) { // TODO fix once skills are implemented
        this.updates.push({
            index: player.index,
            type: UpdateType.DAMAGE,
            damage: damage,
            current: 0,
            max: 10
        })
    }
    npcProjectile(player, npc, projectile) {
        this.updates.push({
            index: player.index,
            type: UpdateType.NPC_PROJECTILE,
            target: npc.index,
            projectile: projectile
        })
    }
    playerProjectile(player, target, projectile) {
        this.updates.push({
            index: player.index,
            type: UpdateType.PLAYER_PROJECTILE,
            target: target.index,
            projectile: projectile
        })
    }
    appearance(player) {
        this.updates.push({
            index: player.index,
            type: UpdateType.APPEARANCE,
            appearance: player.appearance,
            spriteChanges: player.spriteChanges,
            sprites: player.sprites,
            username: player.usernameHash,
            level: player.level,
            skulled: player.skulled > 0
        })
    }
    privilegedChat(player, message) {
        this.updates.push({
            index: player.index,
            type: UpdateType.PRIVILEGED_CHAT_MESSAGE,
            message: message
        })
    }
}

module.exports = PlayerUpdate
