const SmartBuffer = require('smart-buffer').SmartBuffer

// TODO: integrate support for gateway server ....

const LoginResult = {
    success: 0,
    successReconnect: 1,
    invalidCredentials: 3,
    alreadyOnline: 4,
    clientUpdated: 5,
    maxConnectionsExceeded: 6,
    loginAttemptsExceeded: 7,
    serverRejectedSession: 8,
    loginServerRejectedSession: 9,
    temporarilyBanned: 11,
    permanentlyBanned: 12,
    worldFull: 14,
    membershipRequired: 15,
    loginServerTimeout: 16,
    accountLoadingError: 17,
    stolenAccount: 18,
    loginServerMismatch: 20,
    stolenPassword: 22,
    staff: 25,
    error: -1
}

async function emulateGatewayLoginRequest(request) {
    return new Promise((resolve, reject) => {
        if (Math.random() > 0.2) {
            resolve(LoginResult.staff)
        } else {
            reject({
                reason: 'random reject',
                code: LoginResult.temporarilyBanned
            })
        }
    })
}

module.exports.name = 'login'

module.exports.handle = (session, payload) => new Promise(async (resolve, reject) => {
    const packet = SmartBuffer.fromBuffer(payload)

    const request = {
        reconnecting: packet.readInt8() == 1,
        version: packet.readInt16BE(),
        limit30: packet.readInt8(),
        const10: packet.readInt8(),
        clientKeys: [
            packet.readInt32BE(), packet.readInt32BE(),
            packet.readInt32BE(), packet.readInt32BE()
        ],
        userId: packet.readInt32BE(),
        username: packet.readString(20).trim(),
        password: packet.readString(20).trim()
    }

    try {
        const result = await emulateGatewayLoginRequest(request)

        console.log(`login accepted: ${result}`)

        session.advanceState()
        session.write(Buffer.from([result & 0xFF]))
        resolve()
    } catch (error) {
        console.log(`login rejected: ${error.reason}`)

        session.invalidateState()
        session.write(Buffer.from([error.code & 0xFF]))
        reject(error.reason)
    }
})
