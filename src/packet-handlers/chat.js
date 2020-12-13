async function chat({ player }, { message }) {
    if (player.canChat()) {
        player.lastChat = Date.now();
        player.broadcastChat(message);
    }
}

module.exports = { chat };
