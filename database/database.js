const mongoose = require('mongoose');
require('dotenv').config()

let mongoDbTest = process.env.mongoDbTest
let mongoDbProd = process.env.mongoDbProd
var db = mongoose.connection;

mongoose.connect(process.env.MONGO_DATABASE, { useNewUrlParser: true });
db.on('connected', () => {
    console.log('Heroku Database is connected successfully');
});
db.on('disconnected', () => {
    console.log('Heroku Database is disconnected successfully');
})
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;