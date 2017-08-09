// 'mongodb://rohit_got:rohitpah123@ds063919.mlab.com:63919/got_battles_db'
config = {
        "mongo": {
            "hostString": "32-1a.mongo.evennode.com:27017,32-1b.mongo.evennode.com:27017/376fa6fddd9fc4ce1e2d0477b1a3e5e8?replicaSet=eusbg1",
            "user": "376fa6fddd9fc4ce1e2d0477b1a3e5e8",
            "db": "got_battles_db"
        }
    }
    // process.env.NODE_ENV == "development" ? 'mongodb://localhost:27017/got_battles_db' : process.env.MONGODB || process.env.MONGOLAB_URI || 
module.exports = {
    development: process.env.NODE_ENV == 'development',
    db: "mongodb://" + config.mongo.user + ":" + 'rohitpah123' + "@" +
        config.mongo.hostString
}