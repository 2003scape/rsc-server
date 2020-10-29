async function chooseOption({ player }, { option }) {
    if (player.answer) {
        player.answer(option);
    }
}

module.exports = { chooseOption };
