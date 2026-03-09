function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
    return next();
  }
  req.flash('error', 'Silakan login terlebih dahulu');
  res.redirect('/admin/login');
}

module.exports = { requireAuth };
