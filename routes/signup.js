const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const checkUserAuth = require('../lib/check-user-auth');

/**
 * @route GET /accounts/signup/email
 * @desc Signup user using email
 * @access Public
 */
router.get('/', checkUserAuth({
  needLogin: false,
  pageRedirect: '/'
}), (req, res) => {
  res.render('signup');
});

/**
 * @route GET /accounts/signup/email
 * @desc Signup user using email
 * @access Public
 */
router.post('/email', (req, res, next) => {
  const { first_name, last_name, email, username, password, retype_password } = req.body;
  let errors = [];

  // check required fields
	if (!first_name || !last_name || !email || !username || !password || !retype_password) {
		errors.push({ msg: 'Please fill in all fields' });
	}

  // check retyped password if match
	if (password !== retype_password) {
		errors.push({ msg: 'Passwords do not match' });
  }
    
  // check password length
	if (password.length < 6) {
		errors.push({ msg: 'Password should be at least 6 characters' });
  }
    
  // check if there's an error
  if (errors.length > 0) {
	  return res.render('signup', {
			errors,
      first_name,
      last_name,
      email,
      username
		});
  }
  
  // if zero error then check if email already exists
  User.findOne({ email }).then(user => {
    if (user) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('signup', {
        errors,
        first_name,
        last_name,
        email,
        username
      });
    }

    // check if username is already exists
    User.findOne({ username }).then(user => {
      if (user) {
        errors.push({ msg: 'Username must be unique' });
        return res.render('signup', {
          errors,
          first_name,
          last_name,
          email,
          username
        });
      }

      // hash password
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) throw err;
          // save new user to database
          User.create({
            'name.firstName': first_name,
            'name.lastName': last_name,
            email,
            username,
            password: hash
          })
          .then(newUser => {
            // mark new user as logged in 
            req.login(newUser, error => {
              if (error) {
                return next(error);
              } else {
                return res.redirect('/');
              }
            });
          })
          .catch(error => {
            if (error) throw error;
          });
        })
      }); // end password hash
    }); // end username check
  }); // end email check
});

module.exports = router;