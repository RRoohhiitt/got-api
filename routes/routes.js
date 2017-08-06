const express = require('express');
const router = express.Router();
const controllers = require('../Controllers');
const Battles = require('../Models/BattleModel');
const mock_json = require('../mock-battles')
module.exports = function (app) {
    router.get('/list', controllers.listcontroller.list);
    router.get('/createlist', MockList, controllers.listcontroller.create_list);
    router.get('/getcount', controllers.battlecontroller.get_count);
    router.get('/search', controllers.battlecontroller.search);
    router.get('/stats', controllers.battlecontroller.stats);

    app.use('/', router);
}

function MockList(req, res, next) {
    next();
}