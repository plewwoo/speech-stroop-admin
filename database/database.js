const mongoose = require('mongoose');
require('dotenv').config()

let mongoDbTest = process.env.mongoDbTest
let mongoDbProd = process.env.mongoDbProd

mongoose.connect(mongoDbProd, { useNewUrlParser: true });
var db = mongoose.connection;
db.on('connected', () => {
    console.log('Database is connected successfully');
});
db.on('disconnected', () => {
    console.log('Database is disconnected successfully');
})
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;