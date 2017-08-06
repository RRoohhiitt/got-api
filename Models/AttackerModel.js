const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Attacker = new Schema({
    attacker_king: String,
    attacker_commander: String,
    attacker_size: String,
    attacker_1: {
        type: String
    },
    attacker_2: {
        type: String
    },
    attacker_3: {
        type: String
    },
    attacker_4: {
        type: String
    },

});
module.exports = mongoose.model('Attacker', Attacker);