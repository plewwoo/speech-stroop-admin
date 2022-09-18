const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config()

let MONGO_DB_TEST = process.env.MONGO_DB_TEST
let MONGO_DB = process.env.MONGO_DB
var db = mongoose.connection;

mongoose.connect(MONGO_DB, { useNewUrlParser: true });
db.on('connected', () => {
    console.log('Database is connected successfully');
});
db.on('disconnected', () => {
    console.log('Database is disconnected successfully');
})
db.on('error', console.error.bind(console, 'Connection error:'));

module.exports = db;