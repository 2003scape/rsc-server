module.exports = async session => {
    session.send.closeConnection()
    session.close()
}
