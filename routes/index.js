const router = require('express').Router();
const checkUserAuth = require('../lib/check-user-auth');

/**
 * @route GET (/)
 * @desc Render dashboard as Index page
 * @access Public
 */
router.get('/', checkUserAuth({
  needLogin: true,
  pageRedirect: '/accounts/auth/login'
}), (req, res) => {
  res.render('dashboard');
});

module.exports = router;