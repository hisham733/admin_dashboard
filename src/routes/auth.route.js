const express = require('express')
const authController = require('../controllers/auth.controller');  
const authenticated = require('../middlewares/authenticate.middleware');
const guest = require('../middlewares/guest.middleware');
const registerValidator = require('../validators/register.validator');  
const loginValidator = require('../validators/register.validator');


const router = express.Router();  

router.get('/',guest, authController.login);
router.get('/register',guest, authController.register);   
router.post('/', guest, loginValidator, authController.loginUser);
router.post('/register', guest, registerValidator, authController.registerUser);
router.get('/unauthorized',authenticated ,authController.unauthorized)
module.exports = router; 