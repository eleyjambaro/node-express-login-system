module.exports = function(userAuth) {
	// if user is not logged in, redirect
	if (userAuth.needLogin) {
		return function(req, res, next) {
			if(!req.user) {
				return res.redirect(userAuth.pageRedirect);
			}
			next();
		}
	} else {
		// if user is logged in, redirect
		return function(req, res, next) {
			if(req.user) {
				return res.redirect(userAuth.pageRedirect);
			}
			next();
		}
	}
}