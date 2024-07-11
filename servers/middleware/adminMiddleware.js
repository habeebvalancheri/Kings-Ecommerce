// Middleware to redirect if admin is already logged in
exports.redirectIfAdminLoggedIn = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    return res.redirect("/admin-Dashboard");
  } else {
    next();
  }
};

// Middleware to check if admin is logged in
exports.adminLoggedOut = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    return next();
  } else {
    return res.redirect("/adminLogin");
  }
};
