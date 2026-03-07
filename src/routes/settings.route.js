const express = require('express');
const settingsController = require('../controllers/settings.controller');
const { asyncHandler } = require('../utilities');
const authenticated = require('../middlewares/authenticate.middleware');

const router = express.Router();

router.get('/', authenticated, asyncHandler(settingsController.index));
router.post('/', authenticated, asyncHandler(settingsController.update));

module.exports = router;
