const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Defender = new Schema({
    defender_king: String,
    defender_commander: String,
    defender_size: {
        type: Number,
        default: 0
    },
    defender_1: {
        type: String
    },
    defender_2: {
        type: String
    },
    defender_3: {
        type: String
    },
    defender_4: {
        type: String
    },

});
module.exports = mongoose.model('Defender', Defender);