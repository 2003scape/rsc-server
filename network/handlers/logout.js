module.exports.name = 'logout'

module.exports.handle = async session => {
    session.send.closeConnection()
    session.close()
}
