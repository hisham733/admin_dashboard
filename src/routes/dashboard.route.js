const express = require('express');
const router = express.Router();
const authenticated = require('../middlewares/authenticate.middleware');

const dashboardController = require('../controllers/dashboard.controller');

router.use(authenticated); 

router.get('/', dashboardController.show);


module.exports = router;