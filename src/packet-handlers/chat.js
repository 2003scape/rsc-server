async function chat({ player }, { message }) {
    if ((Date.now() - player.lastChat) < 500) {
        return;
    }

    player.lastChat = Date.now();
    player.broadcastChat(message);
}

module.exports = { chat };
