const express = require('express');
const profileController = require('../controllers/profile.controller');
const { asyncHandler } = require('../utilities');
const authenticated = require('../middlewares/authenticate.middleware');

const router = express.Router();

router.get('/', authenticated, asyncHandler(profileController.getProfile));
router.post('/', authenticated, asyncHandler(profileController.updateProfile));

module.exports = router;
