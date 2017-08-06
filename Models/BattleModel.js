const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Battle = new Schema({
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    location: {
        type: String
    },
    region: {
        type: String,
        required: true
    },
    battle_number: {
        type: Number,
        required: true
    },
    attacker_outcome: {
        type: String
    },
    battle_type: {
        type: String
    },
    major_capture: {
        type: Number,
        default: 0
    },
    major_death: {
        type: Number,
        default: 0
    },
    attacker_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attacker',
        required: true
    },
    defender_info: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Defender'
    },
    summer: String

});
module.exports = mongoose.model('Battle', Battle);