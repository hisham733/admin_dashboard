
const authService = require('../services/auth.service');  
const HttpStatus = require('../enums/http.status.enum');

function login (req, res) {
   res.render('auth/login'); 
};

function register(req, res) { 
  res.render('auth/register');
}

function unauthorized(req, res) { 
    res.render('error/error', {
            status: HttpStatus.UNAUTHORIZED,
            label: HttpStatus.getLabel(HttpStatus.UNAUTHORIZED), 
            message: HttpStatus.getMessage(HttpStatus.UNAUTHORIZED)
      }); 
}

async function registerUser(req, res) {
  try {
    const { name, email, password, confirm_password} = req.body;

    await authService.register(name, email, password, confirm_password);
    res.redirect('/');
  } catch (error) {
    console.log(error);
    res.redirect('/register');
  }
}

async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    const user = await authService.login(email, password);

    const permissions = user.role.permissions.map(p => p.name);

    req.session.user = {
      name: user.name,
      email: user.email,
      role: user.role.name,
      permissions: permissions
    };

    res.redirect('/dashboard');

  } catch (error) {
    console.log(error);
    res.redirect('/');
  }
}

module.exports = {
    login, 
    register, 
    unauthorized, 
    registerUser, 
    loginUser
};