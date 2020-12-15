const MAX_SOCIAL_LIST_LENGTH = 100;

async function friendAdd({ player }, { username }) {
    username = username.toLowerCase();

    if (username === player.username) {
        return;
    }

    if (player.friends.length >= MAX_SOCIAL_LIST_LENGTH) {
        return;
    }

    if (player.friends.indexOf(username) > -1) {
        return;
    }

    if (player.ignores.indexOf(username) > -1) {
        return;
    }

    await player.addFriend(username);
}

async function friendRemove({ player }, { username }) {
    username = username.toLowerCase();
    player.removeFriend(username);
}

async function ignoreAdd({ player }, { username }) {
    username = username.toLowerCase();

    if (username === player.username) {
        return;
    }

    if (player.ignores.length >= MAX_SOCIAL_LIST_LENGTH) {
        return;
    }

    if (player.friends.indexOf(username) > -1) {
        return;
    }

    if (player.ignores.indexOf(username) > -1) {
        return;
    }

    player.addIgnore(username);
}

async function ignoreRemove({ player }, { username }) {
    username = username.toLowerCase();
    player.removeIgnore(username);
}

async function privateMessage({ player }, { username, message }) {
    username = username.toLowerCase();

    if (player.friends.indexOf(username) === -1) {
        throw new Error(`player messaging un-added friend: ${username}`);
    }

    if (player.canChat()) {
        player.lastChat = Date.now();
        player.sendPrivateMessage(username, message);
    }
}

module.exports = {
    friendAdd,
    friendRemove,
    ignoreAdd,
    ignoreRemove,
    privateMessage
};
