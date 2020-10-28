async function chooseOption({ player }, { option }) {
    player.answer(option);
}

module.exports = { chooseOption };
