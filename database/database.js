const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config()

let mongoDbTest = process.env.mongoDbTest
let mongoDbProd = process.env.MONGO_DB
var db = mongoose.connection;

mongoose.connect(mongoDbProd, { useNewUrlParser: true });
db.on('connected', () => {
    console.log('Heroku Database is connected successfully');
});
db.on('disconnected', () => {
    console.log('Heroku Database is disconnected successfully');
})
db.on('error', console.error.bind(console, 'connection error:'));

module.exports = db;