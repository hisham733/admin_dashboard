const express = require('express');  
const app = express();
const session = require('express-session'); 
const path = require('path');
const errorHandler = require('./middlewares/error.middleware'); 

app.use(session({  
      secret: "super-secret-key",   
      resave: false,                
      saveUninitialized: false,     
      cookie: {
            maxAge: 1000 * 60 * 60,   
            httpOnly: true,            
      },
})); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


//routes
const dashboard = require('./routes/dashboard.route');
const form = require('./routes/form.route');
const auth = require('./routes/auth.route');
const user = require('./routes/user.route');
const role = require('./routes/role.route');

// Body parser (built-in)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//
app.use('/dashboard', dashboard);  
app.use('/', auth);  
app.use('/user', user); 
app.use('/role', role);
app.use('/form', form);

//error handler middleware 
app.use(errorHandler);

module.exports = app;