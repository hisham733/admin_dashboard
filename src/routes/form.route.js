const express = require('express');  
const formController = require('../controllers/form.controller');  

router = express.Router(); 

router.get('/', formController.create)

module.exports = router;  
