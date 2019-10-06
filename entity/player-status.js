const NORMAL = 0x1
const MODERATOR = 0x2 | NORMAL
const ADMIN = 0x4 | MODERATOR

class PlayerStatus {
    constructor(status) {
        this.status = status
    }
    isNormal() {
        return (this.status & NORMAL) != 0
    }
    isModerator() {
        return (this.status & MODERATOR) != 0
    }
    isAdmin() {
        return (this.status & ADMIN) != 0
    }
}

module.exports = PlayerStatus
