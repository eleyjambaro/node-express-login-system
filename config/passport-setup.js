const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');
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
		callbackURL: '/auth/google/redirect'
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
				})
				.then(newUser => {
					done(null, newUser);
				});
			}
		});  
	})
);

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then(user => {
		done(null, user);
	});
});