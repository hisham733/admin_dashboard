const authService = require('../services/auth.service');  

function login(req, res) {
  res.render('layouts/auth', {
    contentPartial: 'auth/login',
    contentData: {},
    title: 'Sign In'
  });
}

function register(req, res) { 
  res.render('layouts/auth', {
    contentPartial: 'auth/register',
    contentData: {},
    title: 'Create Account'
  });
}

async function registerUser(req, res) {
  const { name, email, password, confirm_password } = req.body;

  if (req.validationError) {
    return res.render('layouts/auth', {
      contentPartial: 'auth/register',
      contentData: { error: req.validationError },
      title: 'Create Account'
    });
  }

  try {
    await authService.register(name, email, password, confirm_password);
    res.redirect('/');
  } catch (err) {
    res.render('layouts/auth', {
      contentPartial: 'auth/register',
      contentData: { error: err.message },
      title: 'Create Account'
    });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (req.validationError) {
    return res.render('layouts/auth', {
      contentPartial: 'auth/login',
      contentData: { error: req.validationError },
      title: 'Sign In'
    });
  }

  try {
    const user = await authService.login(email, password);

    const permissions = user.role.permissions.map(p => p.name);

    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: { name: user.role.name },
      permissions: permissions
    };

    res.redirect('/dashboard');
  } catch (err) {
    res.render('layouts/auth', {
      contentPartial: 'auth/login',
      contentData: { error: err.message },
      title: 'Sign In'
    });
  }
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