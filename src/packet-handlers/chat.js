async function chat({ player }, { message }) {
    if (player.isMuted() || (Date.now() - player.lastChat) < 500) {
        return;
    }

    player.lastChat = Date.now();
    player.broadcastChat(message);
}

module.exports = { chat };
