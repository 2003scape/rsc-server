const bitmasks = new Uint32Array(32)

for (let i = 0; i < 32; i++) {
    bitmasks[i] = (1 << i) - 1
}

class Encoder {
    constructor(id, size) {
        this.id = id
        this.static = !!size
        this.bitCaret = 0

        if (this.static) {
            this.payload = Buffer.alloc(size)
            this.caret = 0
        } else {
            this.payload = []
        }
    }

    addBoolean(bool) {
        return this.addByte(bool ? 1 : 0)
    }

    addByte(byte) {
        if (this.static) {
            this.payload.writeUInt8(byte & 0xFF, this.caret)
            this.caret += 1
        } else {
            this.payload.push(byte & 0xFF)
        }
        return this
    }

    addShort(short) {
        if (this.static) {
            this.payload.writeUInt16BE(short & 0xFFFF, this.caret)
            this.caret += 2
        } else {
            this.payload.push(
                (short & 0xFFFF) >> 8,
                (short & 0xFF))
        }
        return this
    }

    addInt(int) {
        if (this.static) {
            this.payload.writeUInt32BE(int & 0xFFFFFFFF, this.caret)
            this.caret += 4
        } else {
            this.payload.push(
                (int & 0xFFFFFFFF) >> 24,
                (int & 0xFFFFFF) >> 16,
                (int & 0xFFFF) >> 8,
                (int & 0xFF))
        }
        return this
    }

    addLong(long) {
        this.addInt(long.shiftRight(32).toInt())
        this.addInt(long.toInt())
        return this
    }

    addString(string) {
        if (this.static) {
            this.payload.write(string, this.caret)
            this.caret += string.length
        } else {
            for (let i = 0; i < string.length; i += 1) {
                this.payload.push(string.charCodeAt(i) & 0xFF)
            }
        }
        return this
    }

    addBytes(bytes) {
        for (let i = 0; i < bytes.length; i += 1) {
            this.addByte(bytes[i])
        }
        return this
    }

    addBits(value, bits) {
        let byteCaret = this.bitCaret >> 3
        let bitOffset = 8 - (this.bitCaret & 7)

        this.bitCaret += bits

        for (; bits > bitOffset; bitOffset = 8) {
            this.payload[byteCaret] &= ~bitmasks[bitOffset]
            this.payload[byteCaret++] |=
                (value >> (bits - bitOffset)) & bitmasks[bitOffset]

            bits -= bitOffset
        }

        if (bits === bitOffset) {
            this.payload[byteCaret] &= ~bitmasks[bitOffset]
            this.payload[byteCaret] |= value & bitmasks[bitOffset]
        } else {
            this.payload[byteCaret] &= ~(bitmasks[bits] << (bitOffset - bits))
            this.payload[byteCaret] |=
                (value & bitmasks[bits]) << (bitOffset - bits)
        }

        if (this.static) {
            this.caret = byteCaret
        }

        return this
    }

    // Build the final buffer with a header to send to the client.
    build() {
        const length = this.payload.length
        const header = Buffer.alloc(3)

        header.fill(0)

        // If the packet was being dynamically sized, turn it into a static buffer
        // now so the rest of the operations are consistent.
        if (!this.static) {
            this.payload = Buffer.from(this.payload)
        }

        if (length >= 160) {
            header[0] = 160 + ((length + 1) / 256)
            header[1] = (length + 1) & 0xFF
            header[2] = this.id
            return Buffer.concat([header, this.payload], 3 + length)
        } else {
            header[0] = length + 1

            if (length > 0) {
                header[1] = this.payload[length - 1]
                header[2] = this.id

                return Buffer.concat(
                    [header, this.payload.slice(0, length - 1)],
                    3 + length - 1
                )
            } else {
                header[1] = this.id
                return header
            }
        }
    }
}

module.exports = Encoder
