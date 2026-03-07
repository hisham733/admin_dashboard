
const authService = require('../services/auth.service');  

function login (req, res) {
   res.render('auth/login'); 
};

function register(req, res) { 
  res.render('auth/register');
}

async function registerUser(req, res) {
    const { name, email, password, confirm_password} = req.body;

    await authService.register(name, email, password, confirm_password);

    res.redirect('/');
}

async function loginUser(req, res) {
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
}

async function logout(req, res) {  
   
  await authService.logout(req.session);  
  
  res.redirect('/'); 
}

module.exports = {
    login, 
    register, 
    registerUser, 
    loginUser,  
    logout
};