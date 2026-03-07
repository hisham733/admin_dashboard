const express = require('express')
const authController = require('../controllers/auth.controller');  
const guest = require('../middlewares/guest.middleware');
const validateMiddleware = require('../middlewares/validate.middleware');
const registerValidator = require('../validators/register.validator'); 
const {asyncHandler}  = require('../utilities');
const loginValidator = require('../validators/login.validator');


const router = express.Router();  

router.get('/',guest, asyncHandler(authController.login));
router.get('/register',guest, asyncHandler(authController.register));   
router.post('/', guest, loginValidator, validateMiddleware, asyncHandler(authController.loginUser)); 
router.post('/register', guest, registerValidator, validateMiddleware, asyncHandler(authController.registerUser));
router.post('/logout', asyncHandler(authController.logout)); 
module.exports = router; 