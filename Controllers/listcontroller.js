const Attacker = require('../Models/AttackerModel');
const Defender = require('../Models/DefenderModel');
const Battle = require('../Models/BattleModel');
const co = require('co');
const fs = require('fs');
exports.list = function (req, res) {
    Battle.count({}).then((count) => {
            if (count) {
                return Battle.find({}).distinct('location');
            } else {
                res.status(404).end("Database is empty. Create a List First");
            }
        })
        .then((location) => {
            res.status(200).send(location)
            res.end();
        })
        .catch((e) => {
            console.log(e);
            res.status(500).end("Internal Server Error");
        })
}
exports.create_list = function (req, res) {
    let count;
    let battles = Battle.count({}).then((count) => {
        if (!count) {
            return _getMockedList().then((list) => {
                return list;
            })
        } else {
            // res.status(409).end("Database is already filled");
            return Promise.reject({
                status: 409,
                error_text: "Database is already filled"
            });
        }
    });
    battles = battles.then((list) => {
        if (list) {
            let formatted_list = _getFormattedList(list);
            let promises = [];
            for (let i = 0; i < formatted_list.length; i++) {
                promises.push(insertToDb(formatted_list[i]));
            }
            return Promise.all(promises).then(() => {
                res.status(200).end('Operation Successful');
            })
        }
    });
    battles.catch((e) => {
        console.log(e);
        if (e.status)
            res.status(e.status).send(e.error_text);
        else
            res.status(500).send('Internal Server Error');
        res.end();
    });

}

function _getMockedList() {
    return new Promise((resolve, reject) => {
        return fs.readFile('./mock-battles.json', 'utf8', (err, data) => {
            if (!err) {
                return resolve(JSON.parse(data));
            }
            return reject(err);
        });
    });
}

function _getFormattedList(list) {
    let formatted_list = [];

    for (let i = 0; i < list.length; i++) {
        formatted_list[i] = {};
        let attacker_info = {};
        let defender_info = {};
        attacker_info.attacker_king = list[i].attacker_king;
        attacker_info.attacker_commander = list[i].size;
        attacker_info.size = list[i].attacker_commander;
        attacker_info.attacker_1 = list[i].attacker_1;
        attacker_info.attacker_2 = list[i].attacker_2;
        attacker_info.attacker_3 = list[i].attacker_3;
        attacker_info.attacker_4 = list[i].attacker_4;
        attacker_info.attacker_size = list[i].attacker_size;

        attacker_info.size = list[i].size;
        defender_info.defender_king = list[i].defender_king;
        defender_info.defender_commander = list[i].defender_commander;
        defender_info.defender_1 = list[i].defender_1;
        defender_info.defender_2 = list[i].defender_2;
        defender_info.defender_3 = list[i].defender_3;
        defender_info.defender_4 = list[i].defender_4;
        defender_info.defender_size = list[i].defender_size;

        formatted_list[i].name = list[i].name;
        formatted_list[i].year = list[i].year;
        formatted_list[i].location = list[i].location;
        formatted_list[i].region = list[i].region;
        formatted_list[i].battle_number = list[i].battle_number;
        formatted_list[i].attacker_info = attacker_info;
        formatted_list[i].defender_info = defender_info;
        formatted_list[i].attacker_outcome = list[i].attacker_outcome;
        formatted_list[i].battle_type = list[i].battle_type;
        formatted_list[i].major_capture = list[i].major_capture;
        formatted_list[i].major_death = list[i].major_death;
        formatted_list[i].summer = list[i].summer;
    }
    return formatted_list;
}

function insertToDb(battle) {
    let attacker = new Attacker(battle.attacker_info);
    let defender = new Defender(battle.defender_info);
    let newBattle = new Battle(battle);
    return attacker.save().then((result) => {
        newBattle.attacker_info = result._id;
        return defender.save()
    }).then((result) => {
        newBattle.defender_info = result._id;
        return newBattle.save();
    });
}