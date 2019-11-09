class PlayerRank {
    constructor(status) {
        this.rank = status
    }
    isNormal() {
        return (this.rank & PlayerRank.NORMAL) !== 0
    }
    isModerator() {
        return (this.rank & PlayerRank.MODERATOR) !== 0
    }
    isAdmin() {
        return (this.rank & PlayerRank.ADMIN) !== 0
    }
}

PlayerRank.NORMAL = 0x1
PlayerRank.MODERATOR = 0x2 | PlayerRank.NORMAL
PlayerRank.ADMIN = 0x4 | PlayerRank.MODERATOR

module.exports = PlayerRank
