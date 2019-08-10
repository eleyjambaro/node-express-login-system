const router = require('express').Router();
const passport = require('passport');
const checkUserAuth = require('../lib/check-user-auth');

/**
 * @route GET /accounts/auth/login
 * @desc Render user login
 * @access Public
 */
router.get('/login', checkUserAuth({
  isLoggedIn: true,
  pageRedirect: '/'
}), (req, res) => {
  res.render('login');
});

/**
 * @route POST /accounts/auth/login
 * @desc Authenticate user with username and password
 * @access Public
 */
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/accounts/auth/login',
  failureFlash: true
}), (req, res) => {
  res.redirect('/');
});

/**
 * @route GET /accounts/auth/google
 * @desc Auth using Google+ - display Google+ consent screen on the browser
 * @access Public
 */
// 
router.get('/google', checkUserAuth({
  needLogin: false,
  pageRedirect: '/'
}), passport.authenticate('google', { scope: ['profile'] }));

/**
 * @route GET /accounts/auth/google/redirect
 * @desc Setup google callback URL
 * @access Public
 */
// 
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
  res.redirect('/');
});

/**
 * @route GET /accounts/auth/logout
 * @desc Logout user
 * @access Private
 */
router.get('/logout', checkUserAuth({
  needLogin: true,
  pageRedirect: '/accounts/auth/login'
}), (req, res) => {
  req.logOut();
  res.redirect('/accounts/auth/login');
});

module.exports = router;