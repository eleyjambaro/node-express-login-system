const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const flash = require('connect-flash');
const keys = require('./config/keys');
const passport = require('passport');

const app = express();

// require passport config
require('./config/passport-setup');

// connect to database
mongoose.connect(keys.mongoDB.localURI, { useNewUrlParser: true });
mongoose.connection.once('open', () => {
  console.log('Connection to database has been successful!');
}).on('error', error => {
  console.log('Connection to database failed.', error);
});

// setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// configure middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended: false } ));
app.use(cookieParser());
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: [keys.session.cookieKey]
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// global vars
app.use((req, res, next) => {
  res.locals.loginErrorMessage = req.flash('loginErrorMessage');
  res.locals.user = req.user ? req.user : null;
  next();
});

// setup routes
app.use(require('./routes/index'));
app.use('/accounts/signup', require('./routes/signup'));
app.use('/accounts/auth', require('./routes/auth'));

// error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 400;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: error.message
  });
});

const port = process.env.PORT || 5000;

// listen to port
app.listen(port, () => console.log(`Server running on port ${port}.`));