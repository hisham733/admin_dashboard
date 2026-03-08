const express = require('express');
const methodOverride = require('method-override');
const app = express();
const session = require('express-session'); 
const path = require('path');
const errorHandler = require('./middlewares/error.middleware');
const appConfig = require('./configs/app.config');
const loadSettings = require('./middlewares/settings.middleware');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Load settings from DB and make available to views
app.use(loadSettings);

// Session must run before any middleware that reads req.session
app.use(session({
  secret: "super-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60,
    httpOnly: true,
  },
}));

// Make user and path available to all views
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.currentPath = req.path;
  res.locals.toastError = req.query.error || null;
  res.locals.toastSuccess = req.query.success || null;
  next();
});

app.use(express.static(path.join(__dirname, '../public'))); 

//routes
const dashboard = require('./routes/dashboard.route');
const form = require('./routes/form.route');
const auth = require('./routes/auth.route');
const user = require('./routes/user.route');
const role = require('./routes/role.route');
const settings = require('./routes/settings.route');
const profile = require('./routes/profile.route');

// Body parser (built-in)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));


//
app.use('/dashboard', dashboard);  
app.use('/', auth);  
app.use('/user', user); 
app.use('/role', role);
app.use('/settings', settings);
app.use('/profile', profile);
app.use('/form', form);

//error handler middleware 
app.use(errorHandler);

module.exports = app;