module.exports.name = 'logout'

module.exports.handle = session => new Promise(resolve => {
    session.send.closeConnection()
    session.close()
    resolve()
})
