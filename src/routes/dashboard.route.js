const express = require('express');
const router = express.Router();
const authenticated = require('../middlewares/authenticate.middleware');
const {asyncHandler}  = require('../utilities');


const dashboardController = require('../controllers/dashboard.controller');

router.use(authenticated); 

router.get('/', asyncHandler(dashboardController.show));


module.exports = router;