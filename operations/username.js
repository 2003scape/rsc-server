const Long = require('long')

// Performs the "base 37" encoding of the username, required for player
// appearance packets. We have to use the `long` module as JavaScript doesn't
// support 64-bit numbers.

// TODO maybe for effiency we could check the length and run a version of this
// that uses the native JS `Number` type instead of `long` when the length is
// low enough (if it would really provide a significant performance increase).
function base37Encode(username) {
    let hash = Long.fromInt(0, true)

    username = username.toLowerCase().trim()

    for (let i = 0; i < username.length; i += 1) {
        const character = username.charCodeAt(i)

        hash = hash.multiply(Long.fromInt(37))

        if (character >= 97 && character <= 122) {
            hash = hash.add(Long.fromInt(character - 96))
        } else if (character >= 48 && character <= 57) {
            hash = hash.add(Long.fromInt(character - 21))
        }
    }

    return hash
}

module.exports = base37Encode
