const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const moment = require('moment')
const session = require('express-session')
const hostname = 'localhost';
const port = 3001;

const indexRouter = require('./routes/index')

const logger = require('./middleware/logger');

const app = express();

app.use(session({
    secret: 'mysecret',
    saveUninitialized: false,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
})

//Template Engines
const exphbs = hbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutDir: __dirname + '/views/layout',
    helpers: {
        datetimeFormat: (date, format) => {
            return moment(date).locale('th').format(format)
        },
        finalScore: (congruent, incongruent) => {
            return congruent + incongruent
        },
        inc: (value, options) => {
            return parseInt(value) + options
        }
    }
})

app.engine('hbs', exphbs.engine);
app.set('view engine', 'hbs');

//Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Custom Middleware
app.use(logger);

//Routes
app.use('/', indexRouter)

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});