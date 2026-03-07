const express = require('express');
const formController = require('../controllers/form.controller');
const authenticated = require('../middlewares/authenticate.middleware');

const router = express.Router();

router.get('/', authenticated, formController.create);

module.exports = router;  
