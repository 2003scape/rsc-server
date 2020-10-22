// sent after pressing logout button
async function logout(socket) {
    await socket.player.logout();
    delete socket.player;
}

// sent after we send logout success packet or if closing client unexpectedly
async function closeConnection() {}

module.exports = { logout, closeConnection };
