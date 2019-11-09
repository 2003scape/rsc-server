const Long = require('long')

const C_A = 'a'.charCodeAt(0);
const C_Z = 'z'.charCodeAt(0);
const C_0 = '0'.charCodeAt(0);
const C_9 = '9'.charCodeAt(0);

// performs the "base 37" operations on usernames, required for player
// appearance and messaging packets. we have to use the `long` module as Number
// isn't large enough to hold 64 bit integers

module.exports.encode = function encode(username) {
    let hash = Long.fromInt(0, true)

    username = username.toLowerCase().trim()

    for (let i = 0; i < username.length; i += 1) {
        const character = username.charCodeAt(i)

        hash = hash.multiply(37)

        if (character >= C_A && character <= C_Z) {
            hash = hash.add(character - 96)
        } else if (character >= C_0 && character <= C_9) {
            hash = hash.add(character - 21)
        }
    }

    return hash
}
