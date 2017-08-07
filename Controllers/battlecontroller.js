const Attacker = require('../Models/AttackerModel');
const Defender = require('../Models/DefenderModel');
const Battle = require('../Models/BattleModel');
exports.stats = function (req, res) {
    let stats = {}
    Battle.aggregate(
            [{
                '$group': {
                    '_id': null,

                    totalwsins: {
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
                    battle_type: {
                        $addToSet: '$battle_type'
                    }

                }
            }])
        .then((data) => {
            stats.battle_type = [];
            stats.attacker_outcome = {};
            stats.attacker_outcome.wins = data[0].totalwsins;
            stats.attacker_outcome.losses = data[0].totalloss;
            stats.battle_type = data[0].battle_type;

            return Attacker.aggregate([{
                '$group': {
                    '_id': '$attacker_king',
                    count: {
                        $sum: 1
                    }
                }
            }])

        })
        .then((data) => {
            stats.most_active = {};
            stats.most_active.attacker_king = data[0];
            let max_count = data[0].count;
            for (let i = 0; i < data.length; i++) {
                stats.most_active.attacker_king = max_count < data[i].count ? data[i]._id : stats.most_active.attacker_king;
            }
            return Defender.aggregate([{
                '$group': {
                    '_id': '$defender_king',
                    'average': {
                        $avg: '$defender_size'
                    },
                    'min': {
                        $min: '$defender_size'
                    },
                    'max': {
                        $max: '$defender_size'
                    },
                    count: {
                        $sum: 1
                    }
                }
            }])
        })
        .then((data) => {
            stats.most_active.defender_king = data[0];
            let max_count = data[0].count;
            stats.defender_size = {};
            stats.defender_size.average = 0;
            stats.defender_size.min = 0;
            stats.defender_size.max = 0;
            for (let i = 0; i < data.length; i++) {
                let min = data[i].min;
                let max = data[i].max;
                stats.most_active.defender_king = max_count < data[i].count ? data[i]._id : stats.most_active.defender_king;
                stats.defender_size.average += (min + max) / 2;
                stats.defender_size.min = min > data[i].min ? data[i].min : min;
                stats.defender_size.max = max < data[i].max ? data[i].max : max;
            }
            res.status(200).send(JSON.stringify(stats));
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
    let keys = Object.keys(query);
    if (keys.length > 0) {
        let battle_filter = [];
        let attacker_filter = [];
        let defender_filter = [];

        for (let i = 0; i < keys.length; i++) {
            if ('defender'.includes(keys[i])) {
                keys[i] = 'defender_king';
            }
            if ('attacker'.includes(keys[i])) {
                keys[i] = 'attacker_king';
            }
        }

        let battle_filter_object = {};
        let attacker_filter_object = {};
        let defender_filter_object = {};

        Battle
            .findOne({}, {
                _id: 0,
                __v: 0,
            })
            .populate('attacker_info', '-_id -__v')
            .populate('defender_info', '-_id -__v')
            .then((data) => {
                let data_keys = Object.keys(JSON.parse(JSON.stringify(data)));
                battle_data = _getKeyFormatted(data_keys, keys, query);
                battle_filter_object = battle_data.filter_obj;
                battle_filter = battle_data.filter_obj;
                return data;
            })
            .then((data) => {
                //Attacker
                let _attacker_keys = Object.keys(JSON.parse(JSON.stringify(data.attacker_info)));
                attacker_data = _getKeyFormatted(_attacker_keys, keys, query);
                attacker_filter_object = attacker_data.filter_obj;
                attacker_filter = attacker_data.filter_array;

                //Defender
                let _defender_keys = Object.keys(JSON.parse(JSON.stringify(data.defender_info)));
                defender_data = _getKeyFormatted(_defender_keys, keys, query);
                defender_filter_object = defender_data.filter_obj;
                defender_filter = defender_data.filter_array;

                return data;
            })
            .then((data) => {

                if (data) {
                    if (Object.keys(attacker_filter).length > 0 || Object.keys(defender_filter).length > 0 || Object.keys(battle_filter).length > 0) {
                        var attacker_ids = [];
                        var defender_ids = [];
                        if (Object.keys(attacker_filter).length > 0) {
                            if (Object.keys(defender_filter).length > 0) {
                                return Attacker.find(attacker_filter_object, {
                                    _id: 1
                                }).then((docs) => {
                                    if (docs.length > 0) {
                                        attacker_ids = docs;
                                        attacker_ids.map((attacker_id) => {
                                            return attacker_id._id;
                                        });

                                    }
                                    return Defender.find(defender_filter_object, {
                                        _id: 1
                                    }).then((docs) => {
                                        if (docs.length > 0) {
                                            defender_ids = docs;
                                            defender_ids.map((defender_id) => {
                                                return defender_id._id;
                                            });
                                        }
                                        battle_filter_object.$or = [{
                                            attacker_info: {
                                                $in: attacker_ids
                                            }
                                        }, {
                                            defender_info: {
                                                $in: defender_ids
                                            }
                                        }]
                                        return Battle
                                            .find(battle_filter_object)
                                            .populate('attacker_info')
                                            .populate('defender_info')
                                            .then((data) => {
                                                return Promise.resolve(data)
                                            })
                                    })
                                })
                            } else {
                                return Attacker.find(attacker_filter_object, {
                                    _id: 1
                                }).then((docs) => {
                                    if (docs.length > 0) {
                                        attacker_ids = docs;
                                        attacker_ids.map((attacker_id) => {
                                            return attacker_id._id;
                                        });
                                    }
                                    battle_filter_object.attacker_info = {
                                        $in: attacker_ids
                                    }
                                    return Battle
                                        .find(battle_filter_object)
                                        .populate('defender_info')
                                        .populate('attacker_info')
                                        .then((data) => {
                                            return Promise.resolve(data)
                                        })
                                })
                            }
                        } else if (Object.keys(defender_filter).length > 0) {

                            return Defender.find(defender_filter_object, {
                                _id: 1
                            }).then((docs) => {
                                if (docs.length > 0) {
                                    defender_ids = docs;
                                    defender_ids.map((defender_id) => {
                                        return defender_id._id;
                                    });
                                }
                                battle_filter_object.defender_info = {
                                    $in: defender_ids
                                }
                                return Battle
                                    .find(battle_filter_object)
                                    .populate('defender_info')
                                    .populate('attacker_info')
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
        res.status(400).end('Incomplete Parameter Set')
    }
}

function _getKeyFormatted(data_keys, keys, query) {
    let filter_obj = {};
    let filter_array = [];
    data_keys.filter((key) => {
        keys.filter(k => {
            let foundBool = key.includes(k);
            if (foundBool) {
                filter_obj[key.toLowerCase()] = new RegExp(query[k], 'i');
                if (!isNaN(query[k])) {
                    filter_obj[key.toLowerCase()] = parseInt(query[k]);
                }
                filter_array.push(filter_obj);
            }
            return true;
        });
        return true;
    });
    return {
        filter_obj: filter_obj,
        filter_array: filter_array
    }
}