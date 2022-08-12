const mongoose = require('mongoose');
require('dotenv').config()

let mongoDbTest = process.env.mongoDbTest
let mongoDbProd = process.env.mongoDbProd
var db = mongoose.connection;

if (process.env.isHeroku == true){
    mongoose.connect(process.env.MONGO_DATABASE, { useNewUrlParser: true });
    db.on('connected', () => {
        console.log('Database is connected successfully');
    });
    db.on('disconnected', () => {
        console.log('Database is disconnected successfully');
    })
    db.on('error', console.error.bind(console, 'connection error:'));
}
else {
    mongoose.connect(mongoDbProd, { useNewUrlParser: true });
    db.on('connected', () => {
        console.log('Database is connected successfully');
    });
    db.on('disconnected', () => {
        console.log('Database is disconnected successfully');
    })
    db.on('error', console.error.bind(console, 'connection error:'));
}


module.exports = db;