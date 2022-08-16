const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config()

let mongoDbTest = process.env.mongoDbTest
let MONGO_DB = process.env.MONGO_DB
var db = mongoose.connection;

mongoose.connect(mongoDbTest, { useNewUrlParser: true });
db.on('connected', () => {
    console.log('Database is connected successfully');
});
db.on('disconnected', () => {
    console.log('Database is disconnected successfully');
})
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;