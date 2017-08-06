module.exports = {
    development: process.env.NODE_ENV == 'development',
    db: process.env.NODE_ENV == "development" ? 'mongodb://localhost:27017/got_battles_db' : process.env.MONGODB || process.env.MONGOLAB_URI
}