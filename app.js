var express = require('express');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');

var app = express();

// Passport configuration
require('./config/passport')(passport);

// Set up our express application
app.use(express.static(__dirname + '/public'));
app.use("/views", express.static(__dirname + "/public/views"));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(bodyParser.json());
app.set('view engine', 'ejs');  
app.set('views', __dirname + '/public/views');

// required for passport
app.use(session({
	secret: 'superdupersecretmessage',
	resave: true,
	saveUninitialized: true
 } )); // session secret

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

var routes = require('./routes/routes.js')(app, passport)

app.listen(process.env.PORT || 8888, function () {
  console.log('Example app listening on port 8888!')
})