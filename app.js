const path = require('path');
const express = require('express');
const hbs = require('express-handlebars');
const moment = require('moment')
const session = require('express-session')
const PORT = process.env.PORT || 3000;

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
            return moment(date).locale('th').add(543, 'year').format(format)
        },
        yearsOld: (date, format) => {
            return moment().diff(date, format)
        },
        month: (number) => {
            return moment().locale('th').month(number-1).format('MMMM')
        },
        finalScore: (congruent, incongruent) => {
            return congruent + incongruent
        },
        changeMsToS: (ms) => {
            sec = ms/1000
            return sec.toFixed(2)
        },
        scorePercent: (congruent, incongruent) => {
            percent = ((congruent + incongruent) * 100) / 20
            return percent.toFixed()
        },
        congruentPercent: (val) => {
            percent = (val * 100) / 30
            return percent.toFixed()
        },
        pastScorePercent: (val) => {
            percent = (val * 100) / 60
            return percent.toFixed()
        },
        stressPercent: (val) => {
            percent = val * 2
            return percent
        },
        inc: (value, options) => {
            return parseInt(value) + options
        },
        paginationIndex: (value, pageIndex) => {
            return (value + 1) + (10 * pageIndex)
        },
        ifPagination: (name, value1, value2) => {
            if (value1 == value2) {
                return `<li class="page-item active"><a class="page-link" href="/${name}/${value2}">${value2}</a></li>`
            }
            else {
                return `<li class="page-item"><a class="page-link" href="/${name}/${value2}">${value2}</a></li>`
            }
        },
        reverseArray: (array) => {
            return array.reverse()
        }
    }
})

app.engine('hbs', exphbs.engine);
app.set('view engine', 'hbs');

//Middleware
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//Custom Middleware
app.use(logger);

//Routes
app.use('/', indexRouter)

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});