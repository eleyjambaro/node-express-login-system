const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const app = express();

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