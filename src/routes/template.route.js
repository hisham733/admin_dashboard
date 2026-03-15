const express = require('express');
const templateController = require('../controllers/template.controller');
const authenticated = require('../middlewares/authenticate.middleware');
const { asyncHandler } = require('../utilities');

const router = express.Router();

router.get('/exists', authenticated, asyncHandler(templateController.hasTemplate));
router.get('/', authenticated, asyncHandler(templateController.getTemplate));

module.exports = router;
