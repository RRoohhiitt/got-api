const express = require('express');
const bodyParser = require('body-parser');
const app = module.exports = express();
const config = require('./config/config');
const mongoose = require('mongoose');
app.use(express.static(__dirname + '/public_html', {
    maxAge: 86400000
}));
mongoose.Promise = global.Promise;
let promise = mongoose.connect(config.db, {
    useMongoClient: true
})
promise.then((db) => {
    if (config.development) {
        console.log("mongo connection started on : ", config.db)
    }
    setupApp();
})

promise.catch(e => {
    if (config.development) {
        console.log("sevrer started on 8088");
    }
})
app.use(bodyParser.json());

function setupApp() {
    require('./routes/routes')(app);
    app.listen('80', () => {
        if (config.development) {
            console.log("sevrer started on 80");
        }
    });

}