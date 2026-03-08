const HttpStatus = require('../enums/http.status.enum');

function authenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }

  if (req.get('Accept')?.includes('application/json')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: HttpStatus.getMessage(401)
    });
  }

  res.redirect('/');
}

module.exports = authenticated;
