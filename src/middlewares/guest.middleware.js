function guest(req, res, next) {

  if (req.session?.user) {

    const redirectTo = req.session.redirectTo || '/dashboard';
    delete req.session.redirectTo;

    return res.redirect(redirectTo);
  }

  next();
}

module.exports = guest;