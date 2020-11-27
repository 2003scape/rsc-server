const BOOKSHELF_ID = 67;
const BOOK_ID = 30;

async function onGameObjectCommandTwo(player, gameObject) {
    if (gameObject.id !== BOOKSHELF_ID) {
        return false;
    }

    const questStage = player.questStages.shieldOfArrav;

    if (questStage === 1) {
        await player.say(
            "Aha the shield of Arrav",
            "That was what I was looking for"
        );

        player.inventory.add(BOOK_ID);
        player.questStages.shieldOfArrav = 2;
    } else {
        player.message("A large collection of books");
    }

    return true;
}

module.exports = { onGameObjectCommandTwo };
