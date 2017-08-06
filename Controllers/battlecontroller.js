const Attacker = require('../Models/AttackerModel');
const Defender = require('../Models/DefenderModel');
const Battle = require('../Models/BattleModel');
exports.stats = function (req, res) {
    var allData = {};
    Battle.aggregate(
            [{
                '$group': {
                    '_id': {
                        'battle_type': "$battle_type"
                    },

                    totalwins: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["$attacker_outcome", "win"]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    totalloss: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["loss", "$attacker_outcome"]
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    },
                    count: {
                        $sum: 1
                    },

                },
            }])
        .then((data) => {
            allData.battle = data;

            return Attacker.aggregate([{
                '$group': {
                    '_id': '$attacker_king'
                }
            }])

        })
        .then((data) => {
            console.log(allData);
            allData.attacker = data;
            return Defender.aggregate([{
                '$group': {
                    '_id': '$defender_king',
                    itemsSold: {
                        $addToSet: "$defender_king"
                    },
                    active_for: {
                        $max: {
                            $cond: {
                                if: {
                                    $eq: []
                                },
                                then: 1,
                                else: 0
                            }
                        }
                    }
                }
            }])
        })
        .then((data) => {
            allData.defender = data;
            res.status(200).send(allData);
            res.end();
        }).catch(e => {
            res.status(400).send(e);
            res.end();
        })
}
exports.get_count = function (req, res) {
    Battle.count({}).then((count) => {
        res.status(200).end(JSON.stringify({
            count: count
        }));
    }).catch((e) => {
        console.log(e);
        res.status(500).end("Internal Server Error");
    });
}
exports.search = function (req, res) {
    let query = req.query;
    console.log(query);
    let keys = Object.keys(query);


    if (keys.length > 0) {
        let battle_filter = [];
        let attacker_filter = [];
        let defender_filter = [];
        Battle.findOne({}, {
                _id: 0,
                __v: 0,
                attacker_info: 0,
                defender_info: 0
            })
            .then((data) => {
                let data_keys = Object.keys(JSON.parse(JSON.stringify(data)));
                let foundIndex = [];
                data_keys.filter((key) => {
                    keys = keys.filter(k => {
                        let foundBool = key.includes(k);

                        if (foundBool) {
                            let a = {}
                            a[key.toLowerCase()] = new RegExp(query[k], 'i')
                            battle_filter.push(a);
                            // return false;
                        }
                        return true;
                    });
                    return true;
                });

                return Attacker.findOne({}, {
                    _id: 0,
                    __v: 0
                });

            })
            .then((data) => {

                if (data) {

                    let data_keys = Object.keys(JSON.parse(JSON.stringify(data)));

                    data_keys.filter((key) => {
                        keys = keys.filter(k => {
                            let foundBool = key.includes(k);
                            if (foundBool) {
                                let a = {}
                                a[key.toLowerCase()] = new RegExp(query[k], 'i')
                                attacker_filter.push(a)
                                // return true
                            }
                            return true;
                        });
                        return true;
                    });
                }
                return Defender.findOne({}, {
                    _id: 0,
                    __v: 0
                });
            })
            .then((data) => {
                if (data) {
                    let data_keys = Object.keys(JSON.parse(JSON.stringify(data)));
                    data_keys.filter((key) => {
                        keys = keys.filter(k => {
                            let foundBool = key.includes(k);
                            // console.log(key, k)
                            if (foundBool) {
                                let a = {}
                                a[key.toLowerCase()] = new RegExp(query[k], 'i')
                                defender_filter.push(a);
                                // return true
                            }
                            return true;
                        });
                        return true;
                    });
                }
                return Promise.resolve(true);

            })
            .then((data) => {
                if (data) {
                    if (Object.keys(attacker_filter).length > 0 || Object.keys(defender_filter).length > 0 || Object.keys(battle_filter).length > 0) {
                        var attacker_ids = [];
                        var defender_ids = [];
                        console.log('adsd')
                        if (Object.keys(attacker_filter).length > 0) {
                            if (Object.keys(defender_filter).length > 0) {

                                return Attacker.find({
                                    $or: attacker_filter
                                }, {
                                    _id: 1
                                }).then((docs) => {
                                    if (docs.length > 0) {
                                        attacker_ids = docs;
                                    }
                                    return Defender.find({
                                        $or: defender_filter
                                    }, {
                                        _id: 1
                                    }).then((docs) => {
                                        if (docs.length > 0) {
                                            defender_ids = docs;
                                        }

                                        return Battle.find(battle_filter)
                                            .populate({
                                                path: 'attacker_info',
                                                match: attacker_filter
                                            })
                                            .populate({
                                                path: 'defender_info',
                                                match: defender_filter
                                            })
                                            .then((data) => {
                                                return Promise.resolve(data)
                                            })
                                    })
                                })
                            } else {
                                return Attacker.find({
                                    $or: attacker_filter
                                }, {
                                    _id: 1
                                }).then((docs) => {
                                    if (docs.length > 0) {
                                        attacker_ids = docs;
                                    }
                                    return Battle.find(battle_filter)
                                        .populate('attacker_info')
                                        .where('_id').in(attacker_ids)
                                        .then((data) => {
                                            return Promise.resolve(data)
                                        })
                                })
                            }
                        } else if (Object.keys(defender_filter).length > 0) {

                            return Defender.find({
                                defender_filter
                            }, {
                                _id: 1
                            }).then((docs) => {
                                if (docs.length > 0) {
                                    defender_ids = docs;
                                }

                                return Battle.find(battle_filter)
                                    .populate({
                                        path: 'defender_info'
                                    })
                                    .populate({
                                        path: 'attacker_info'
                                    })
                                    .then((data) => {
                                        return Promise.resolve(data)
                                    })
                            })



                        }

                    }

                } else {
                    return Promise.resolve(null);
                }
            })
            .then((data) => {
                console.log('asdasda');
                if (data == null) {
                    res.status(404).end("Invalid Query ! Please check query again");
                }
                res.status(200).end(JSON.stringify(data));

            })
            .catch((e) => {
                console.log(e);
                res.status(500).end("Internal Server Error")
            })

    } else {
        res.end(400).end('Incomplete Parameters')
    }
}