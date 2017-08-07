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
promise = promise.then((db) => {
    if (config.development) {
        console.log("mongo connection started on : ", config.db)
    }
    setupApp();
})
promise.catch(e => {
    console.log(e);
    process.exit(1);
})
app.use(bodyParser.json());

function setupApp() {
    require('./routes/routes')(app);
    app.listen(process.env.PORT || '8088', () => {
        if (config.development) {
            console.log("sevrer started on 8088");
        }
    });

}