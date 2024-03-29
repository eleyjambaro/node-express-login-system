const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
const FacebookStrategy = require('passport-facebook').Strategy;
const keys = require('./keys');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// use local auth
passport.use(new LocalStrategy({
  passReqToCallback: true 
}, (req, username, password, done) => {
User.findOne({ username })
.then(user => {
  if (!user) {
    done(null, false, req.flash('loginErrorMessage', 'Username or password invalid'));
  }
  // match the password
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) throw err;

    if (isMatch) {
      return done(null, user);
    } else {
      return done(null, false, req.flash('loginErrorMessage', 'Username or password invalid'));
    }
  });
})
.catch(error => {
  done(error);
});
}));

// use google auth
passport.use(
  new GoogleStrategy({
    clientSecret: keys.google.clientSecret,
    clientID: keys.google.clientID,
    callbackURL: '/accounts/auth/google/redirect'
  }, (accessToken, refreshToken, profile, done) => {
    // check if the user already exists in database
    User.findOne({ googleID: profile.id }).then(currentUser => {
      // if user exists
      if (currentUser) {
        done(null, currentUser);
      } else {
        // save the new user to database
        User.create({
          googleID: profile.id,
          avatar_url : profile._json.picture,
          'name.firstName': profile._json.given_name,
          'name.lastName': profile._json.family_name,
          email: profile._json.email
        })
        .then(newUser => {
          done(null, newUser);
        })
        .catch(error => {
          done(error);
        });
      }
    });
  })
);

// use facebook auth
passport.use(
  new FacebookStrategy({
    clientID: keys.facebook.clientID,
    clientSecret: keys.facebook.clientSecret,
    profileFields: ['email', 'first_name', 'last_name'],
    callbackURL: 'http://localhost:5000/accounts/auth/facebook/redirect',
    passReqToCallback: true
  }, (req, accessToken, refreshToken, profile, done) => {
    // check if the user already exists in database
    User.findOne({ facebookID: profile.id }).then(currentUser => {
      // if user exists
      if (currentUser) {
        done(null, currentUser);
      } else {
        // save the new user to database
        User.create({
          facebookID: profile.id,
          'name.firstName': profile._json.first_name,
          'name.lastName': profile._json.last_name
        })
        .then(newUser => {
          done(null, newUser);
        })
        .catch(error => {
          done(error);
        });
      }
    });
  })
)

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});